"use server";

/**
 * Email sequences — multi-step outreach (Nimble Email Sequences).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { EMAIL_SEQUENCE_TEMPLATES } from "@/lib/crm/sequence-templates";
import { processDueSequenceEnrollments } from "@/lib/crm/email-sequences";
import type { ActionResult } from "@/app/actions/members";

export async function listEmailSequences(orgSlug: string) {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const sequences = await db.emailSequence.findMany({
      include: { steps: { orderBy: { stepOrder: "asc" } }, _count: { select: { enrollments: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return { ok: true as const, data: sequences };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function createSequenceFromTemplate(
  orgSlug: string,
  templateKey: string,
): Promise<ActionResult & { sequenceId?: string }> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const t = EMAIL_SEQUENCE_TEMPLATES.find((x) => x.key === templateKey);
    if (!t) return { ok: false, error: "Template not found" };

    const db = getOrgDb(staff.orgId);
    const seq = await db.emailSequence.create({
      data: {
        orgId: staff.orgId,
        name: t.name,
        description: t.description,
        fromTemplate: t.key,
        status: "DRAFT",
        steps: {
          create: t.steps.map((s) => ({
            orgId: staff.orgId,
            stepOrder: s.stepOrder,
            delayDays: s.delayDays,
            subject: s.subject,
            bodyText: s.bodyText,
          })),
        },
      },
    });

    revalidatePath(`/${orgSlug}/engage/sequences`);
    return { ok: true, sequenceId: seq.id };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function activateEmailSequence(orgSlug: string, sequenceId: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.emailSequence.update({
      where: { id: sequenceId },
      data: { status: "ACTIVE" },
    });
    revalidatePath(`/${orgSlug}/engage/sequences`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function enrollMemberInSequence(
  orgSlug: string,
  sequenceId: string,
  memberId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const seq = await db.emailSequence.findFirst({ where: { id: sequenceId, status: "ACTIVE" } });
    if (!seq) return { ok: false, error: "Sequence not found or not active" };

    const existing = await db.emailSequenceEnrollment.findFirst({
      where: { sequenceId, memberId, status: "ACTIVE" },
    });
    if (existing) return { ok: false, error: "Member already enrolled" };

    await db.emailSequenceEnrollment.create({
      data: {
        orgId: staff.orgId,
        sequenceId,
        memberId,
        currentStep: 0,
        nextSendAt: new Date(),
      },
    });

    revalidatePath(`/${orgSlug}/engage/sequences`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function runDueEmailSequences(orgSlug: string): Promise<ActionResult & { sent?: number }> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const result = await processDueSequenceEnrollments(db, staff.orgId);
    revalidatePath(`/${orgSlug}/engage/sequences`);
    return { ok: true, sent: result.sent };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function ensureDemoEmailSequences(orgSlug: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const count = await db.emailSequence.count();
    if (count > 0) return { ok: true };

    for (const t of EMAIL_SEQUENCE_TEMPLATES.slice(0, 2)) {
      await db.emailSequence.create({
        data: {
          orgId: staff.orgId,
          name: t.name,
          description: t.description,
          fromTemplate: t.key,
          status: "ACTIVE",
          steps: {
            create: t.steps.map((s) => ({
              orgId: staff.orgId,
              stepOrder: s.stepOrder,
              delayDays: s.delayDays,
              subject: s.subject,
              bodyText: s.bodyText,
            })),
          },
        },
      });
    }
    revalidatePath(`/${orgSlug}/engage/sequences`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
