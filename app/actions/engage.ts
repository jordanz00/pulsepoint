"use server";

/**
 * PulsePoint Engage — server actions (alpha).
 *
 * SCOPE: Templates, audiences (filtered Member queries), campaigns. Send goes
 * through the email adapter chain (Resend → SMTP → log). Throttled to 50
 * recipients/campaign in alpha until volume controls land.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";
import {
  PAGE_SIZE,
  buildCursorQuery,
  paginateSlice,
  type PaginatedResult,
} from "@/lib/pagination";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import { filterMembersByAudience } from "@/lib/engage/recipient-filter";
import { recordAutomationException } from "@/lib/automation-exception";

const templateInputSchema = z.object({
  name: z.string().min(1).max(120).regex(/^[A-Za-z0-9 _-]+$/),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(10_000),
  bodyHtml: z.string().max(40_000).optional().default(""),
  approved: z.coerce.boolean().default(false),
});

const audienceFilterSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "LAPSED"]).optional(),
  tag: z.string().max(60).optional(),
  workforcePersona: z
    .enum(["NONE", "STUDENT", "NEW_GRAD", "CAREER_CHANGER", "EXPERIENCED", "EMPLOYER_PARTNER"])
    .optional(),
});

const audienceInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
  filter: audienceFilterSchema,
});

const campaignInputSchema = z.object({
  templateId: z.string().cuid(),
  audienceId: z.string().cuid(),
});

export async function createTemplate(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("org:settings", { orgSlug });
  const parsed = templateInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid template" };
  const db = getOrgDb(staff.orgId);
  const created = await db.emailTemplate.create({
    data: { orgId: staff.orgId, ...parsed.data },
  });
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "engage.template.create",
    entity: "EmailTemplate",
    entityId: created.id,
  });
  revalidatePath(`/${orgSlug}/engage`);
  return { ok: true as const };
}

export async function createAudience(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("org:settings", { orgSlug });
  const parsed = audienceInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid audience" };
  const db = getOrgDb(staff.orgId);
  const created = await db.emailAudience.create({
    data: {
      orgId: staff.orgId,
      name: parsed.data.name,
      description: parsed.data.description,
      filter: parsed.data.filter,
    },
  });
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "engage.audience.create",
    entity: "EmailAudience",
    entityId: created.id,
  });
  revalidatePath(`/${orgSlug}/engage`);
  return { ok: true as const };
}

const ENGAGE_SEND_LIMIT = Number(process.env.ENGAGE_SEND_LIMIT ?? "50");

export async function sendCampaign(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("org:settings", { orgSlug });
  const parsed = campaignInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid campaign" };
  const db = getOrgDb(staff.orgId);

  const template = await db.emailTemplate.findUnique({ where: { id: parsed.data.templateId } });
  const audience = await db.emailAudience.findUnique({ where: { id: parsed.data.audienceId } });
  if (!template || !audience) return { ok: false as const, error: "Template or audience missing" };
  if (!template.approved) return { ok: false as const, error: "Template not approved" };

  const filter = audienceFilterSchema.safeParse(audience.filter);
  if (!filter.success) return { ok: false as const, error: "Audience filter invalid" };

  const memberPool = await db.member.findMany({
    where: { email: { not: null } },
    select: { email: true, tags: true, status: true, workforcePersona: true },
    take: ENGAGE_SEND_LIMIT * 4,
  });
  const filtered = filterMembersByAudience(memberPool, filter.data);
  const recipients = filtered.slice(0, ENGAGE_SEND_LIMIT);

  const campaign = await db.emailCampaign.create({
    data: {
      orgId: staff.orgId,
      templateId: template.id,
      audienceId: audience.id,
      status: "SENDING",
    },
  });

  let sent = 0;
  let failed = 0;
  for (const recipient of recipients) {
    if (!recipient.email) continue;
    const result = await sendEmailWithFailover({
      to: recipient.email,
      subject: template.subject,
      text: template.bodyText,
      html: template.bodyHtml || undefined,
      idempotencyKey: `campaign_${campaign.id}_${recipient.email}`,
    });
    await db.emailSendLog.create({
      data: {
        orgId: staff.orgId,
        campaignId: campaign.id,
        recipient: recipient.email,
        subject: template.subject,
        adapterId: result.adapterId,
        result: result.status,
        providerId: result.providerMessageId,
      },
    });
    if (result.status === "sent") sent++;
    else failed++;
  }

  if (failed > 0) {
    await recordAutomationException({
      orgId: staff.orgId,
      workflow: "engage.campaign.send",
      step: "email.adapter",
      outcome: sent > 0 ? "PARTIAL_SUCCESS" : "FAILED",
      message:
        sent > 0
          ? `${failed} of ${recipients.length} messages failed — check send log and retry.`
          : "Campaign send failed — no messages delivered. Check email adapter configuration.",
      context: { campaignId: campaign.id, sent, failed, attempted: recipients.length },
    });
  }

  await db.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: sent > 0 ? "SENT" : "CANCELLED", sentAt: sent > 0 ? new Date() : null },
  });

  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "engage.campaign.send",
    entity: "EmailCampaign",
    entityId: campaign.id,
    diff: { sent, failed, attempted: recipients.length },
  });

  revalidatePath(`/${orgSlug}/engage`);
  revalidatePath(`/${orgSlug}/exceptions`);

  if (sent === 0 && recipients.length > 0) {
    return {
      ok: false as const,
      error: "Send failed — check Exceptions for details.",
    };
  }

  return {
    ok: true as const,
    sent,
    attempted: recipients.length,
    warning:
      failed > 0
        ? `${failed} message(s) failed — see Exceptions queue.`
        : undefined,
  };
}

export async function getEngageCampaigns(
  raw: { cursor?: string; take?: number },
  orgSlug?: string,
): Promise<
  ActionResult<
    PaginatedResult<
      Awaited<ReturnType<ReturnType<typeof getOrgDb>["emailCampaign"]["findMany"]>>[number]
    >
  >
> {
  try {
    const staff = await requireCapability("engage:manage", { orgSlug });
    const take = Math.min(Math.max(raw.take ?? PAGE_SIZE, 1), 100);
    const db = getOrgDb(staff.orgId);

    const [totalCount, rows] = await Promise.all([
      db.emailCampaign.count(),
      db.emailCampaign.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...buildCursorQuery(raw.cursor),
        include: {
          template: { select: { name: true, subject: true } },
          audience: { select: { name: true } },
        },
      }),
    ]);

    assertAllRowsBelongToOrg(rows, staff.orgId, "getEngageCampaigns");
    const { items, nextCursor } = paginateSlice(rows, take);
    return { ok: true, data: { items, nextCursor, totalCount } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
