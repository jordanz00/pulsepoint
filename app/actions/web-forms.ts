"use server";

/**
 * Hosted web forms + post-submission email (Nimble Web Forms + post-submission).
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_LEAD_FORM_FIELDS,
  normalizeFormPayload,
  parseWebFormFields,
} from "@/lib/crm/web-form-fields";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import { runSoftFailStep } from "@/lib/automation";
import { enrollMemberInSequence } from "@/app/actions/email-sequences";
import { startCrmWorkflowRun } from "@/app/actions/crm-workflows";
import type { ActionResult } from "@/app/actions/members";
import { memberTagsJson } from "@/lib/member-tags";

const createFormSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  confirmEmailSubject: z.string().max(200).optional(),
  confirmEmailBody: z.string().max(5000).optional(),
  published: z.boolean().optional(),
});

export async function listWebForms(orgSlug: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const forms = await db.webForm.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { submissions: true } } },
    });
    return { ok: true as const, data: forms };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function createWebForm(orgSlug: string, raw: unknown): Promise<ActionResult & { formId?: string }> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = createFormSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid form" };

    const db = getOrgDb(staff.orgId);
    const exists = await db.webForm.findFirst({
      where: { slug: parsed.data.slug },
    });
    if (exists) return { ok: false, error: "Slug already in use" };

    const form = await db.webForm.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? "",
        fields: DEFAULT_LEAD_FORM_FIELDS,
        published: parsed.data.published ?? false,
        confirmEmailSubject:
          parsed.data.confirmEmailSubject ?? "Thanks for reaching out",
        confirmEmailBody:
          parsed.data.confirmEmailBody ??
          "We received your submission and will follow up shortly.",
      },
    });

    revalidatePath(`/${staff.orgSlug}/crm/forms`);
    return { ok: true, formId: form.id };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function publishWebForm(orgSlug: string, formId: string, published: boolean): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.webForm.update({ where: { id: formId }, data: { published } });
    revalidatePath(`/${staff.orgSlug}/crm/forms`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Public submit — creates/updates member, optional confirmation email + workflow. */
export async function submitPublicWebForm(
  orgSlug: string,
  formSlug: string,
  raw: Record<string, unknown>,
): Promise<ActionResult & { memberId?: string }> {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const form = await db.webForm.findFirst({
    where: { slug: formSlug, published: true },
  });
  if (!form) return { ok: false, error: "Form not found" };

  const fields = parseWebFormFields(form.fields);
  let payload: Record<string, string>;
  try {
    payload = normalizeFormPayload(fields, raw);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid submission" };
  }

  const email = payload.email;
  if (!email) return { ok: false, error: "Email required" };

  let member = await db.member.findFirst({ where: { email } });
  if (!member) {
    member = await db.member.create({
      data: {
        orgId: org.id,
        email,
        firstName: payload.firstName ?? "Lead",
        lastName: payload.lastName ?? "",
        company: payload.company ?? "",
        jobTitle: payload.jobTitle ?? "",
        status: "ACTIVE",
        tags: memberTagsJson(
          payload.interest ? [`interest:${payload.interest.toLowerCase()}`] : [],
        ) as Prisma.InputJsonValue,
        customFields: {} as Prisma.InputJsonValue,
      },
    });
  } else {
    await db.member.update({
      where: { id: member.id },
      data: {
        firstName: payload.firstName || member.firstName,
        lastName: payload.lastName || member.lastName,
        company: payload.company || member.company,
        jobTitle: payload.jobTitle || member.jobTitle,
      },
    });
  }

  await db.webFormSubmission.create({
    data: {
      orgId: org.id,
      formId: form.id,
      memberId: member.id,
      payload,
    },
  });

  if (form.confirmEmailSubject && form.confirmEmailBody) {
    await runSoftFailStep({
      orgId: org.id,
      workflow: "crm.web_form.confirm",
      step: form.id,
      run: async () => {
        await sendEmailWithFailover({
          to: email,
          subject: form.confirmEmailSubject!,
          text: form.confirmEmailBody!,
          html: form.confirmEmailBody!.replace(/\n/g, "<br>"),
        });
      },
    });
  }

  if (form.enrollSequenceId) {
    await enrollMemberInSequence(orgSlug, form.enrollSequenceId, member.id);
  }

  if (form.addToWorkflowId) {
    await startCrmWorkflowRun(form.addToWorkflowId, member.id, orgSlug);
  }

  return { ok: true, memberId: member.id };
}

export async function ensureDefaultLeadCaptureForm(orgSlug: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const exists = await db.webForm.findFirst({ where: { slug: "lead-capture" } });
    if (exists) return { ok: true };

    const workflow = await db.crmWorkflow.findFirst({
      where: { fromTemplate: "lead_qualification" },
    });

    await db.webForm.create({
      data: {
        orgId: staff.orgId,
        slug: "lead-capture",
        name: "Lead capture",
        description: "Default inbound lead form with automatic thank-you email.",
        fields: DEFAULT_LEAD_FORM_FIELDS,
        published: true,
        confirmEmailSubject: "Thanks — we received your request",
        confirmEmailBody:
          "Thank you for contacting us. A team member will follow up within one business day.",
        addToWorkflowId: workflow?.id,
      },
    });

    revalidatePath(`/${staff.orgSlug}/crm/forms`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
