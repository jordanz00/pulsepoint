"use server";

/**
 * PulsePoint Advocacy — issues, campaigns, take-action audience launch (alpha).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { requireCapability } from "@/lib/permissions";
import { getIssueTemplate } from "@/lib/advocacy/issue-templates";

const issueInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(2000).optional().default(""),
  jurisdiction: z.enum(["STATE", "FEDERAL", "BOTH"]).default("STATE"),
  billNumber: z.string().trim().max(80).optional().default(""),
  status: z.enum(["TRACKING", "ACTIVE", "WON", "LOST", "CLOSED"]).default("TRACKING"),
  issueArea: z
    .enum([
      "ACCESS_TO_CARE",
      "MATERNAL_HEALTH",
      "WORKPLACE_VIOLENCE",
      "BEHAVIORAL_HEALTH",
      "SUBSTANCE_USE",
      "SDOH_FOOD_ACCESS",
      "PHYSICIAN_ACCESS",
      "NURSING_WORKFORCE",
      "GENERAL",
    ])
    .optional()
    .default("GENERAL"),
  publicSlug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/i)
    .optional()
    .default(""),
});

const templateIssueSchema = z.object({
  templateSlug: z.string().trim().min(2).max(80),
});

const updateIssueSchema = z.object({
  issueId: z.string().cuid(),
  title: z.string().trim().min(2).max(200).optional(),
  summary: z.string().trim().max(2000).optional(),
  status: z.enum(["TRACKING", "ACTIVE", "WON", "LOST", "CLOSED"]).optional(),
  billNumber: z.string().trim().max(80).optional(),
});

const deleteIssueSchema = z.object({
  issueId: z.string().cuid(),
});

const campaignInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  issueId: z.string().cuid().optional(),
});

const launchSchema = z.object({
  campaignId: z.string().cuid(),
});

const responseSchema = z.object({
  campaignId: z.string().cuid(),
  increment: z.coerce.number().int().min(1).max(100).default(1),
});

export async function createAdvocacyIssue(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = issueInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid issue" };

    const db = getOrgDb(staff.orgId);
    const created = await db.advocacyIssue.create({
      data: {
        orgId: staff.orgId,
        title: parsed.data.title,
        summary: parsed.data.summary,
        jurisdiction: parsed.data.jurisdiction,
        billNumber: parsed.data.billNumber || null,
        status: parsed.data.status,
        issueArea: parsed.data.issueArea,
        publicSlug: parsed.data.publicSlug || null,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.issue.create",
      entity: "AdvocacyIssue",
      entityId: created.id,
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    revalidatePath(`/${orgSlug}/enterprise/advocacy/issues`);
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Create issue from healthcare advocacy template (alpha — illustrative copy until SME review). */
export async function createAdvocacyIssueFromTemplate(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string; publicSlug: string }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = templateIssueSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid template" };

    const template = getIssueTemplate(parsed.data.templateSlug);
    if (!template) return { ok: false, error: "Template not found" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.advocacyIssue.findFirst({
      where: { orgId: staff.orgId, publicSlug: template.slug },
    });
    if (existing) {
      return { ok: false, error: "Issue already exists for this template" };
    }

    const created = await db.advocacyIssue.create({
      data: {
        orgId: staff.orgId,
        title: template.title,
        summary: template.summary,
        jurisdiction: template.jurisdiction,
        issueArea: template.area,
        publicSlug: template.slug,
        status: "TRACKING",
        contentMeta: template.contentMeta,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.issue.create_template",
      entity: "AdvocacyIssue",
      entityId: created.id,
      diff: { templateSlug: template.slug, issueArea: template.area },
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    revalidatePath(`/${orgSlug}/enterprise/advocacy/issues`);
    revalidatePath(`/${orgSlug}/advocacy/issues/${template.slug}`);
    return { ok: true, data: { id: created.id, publicSlug: template.slug } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateAdvocacyIssue(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = updateIssueSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid update" };

    const db = getOrgDb(staff.orgId);
    const issue = await db.advocacyIssue.findUnique({ where: { id: parsed.data.issueId } });
    if (!issue || issue.orgId !== staff.orgId) return { ok: false, error: "Issue not found" };

    const updated = await db.advocacyIssue.update({
      where: { id: issue.id },
      data: {
        title: parsed.data.title ?? issue.title,
        summary: parsed.data.summary ?? issue.summary,
        status: parsed.data.status ?? issue.status,
        billNumber:
          parsed.data.billNumber !== undefined
            ? parsed.data.billNumber || null
            : issue.billNumber,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.issue.update",
      entity: "AdvocacyIssue",
      entityId: updated.id,
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    revalidatePath(`/${orgSlug}/enterprise/advocacy/issues`);
    if (issue.publicSlug) {
      revalidatePath(`/${orgSlug}/advocacy/issues/${issue.publicSlug}`);
    }
    return { ok: true, data: { id: updated.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteAdvocacyIssue(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = deleteIssueSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid delete" };

    const db = getOrgDb(staff.orgId);
    const issue = await db.advocacyIssue.findUnique({ where: { id: parsed.data.issueId } });
    if (!issue || issue.orgId !== staff.orgId) return { ok: false, error: "Issue not found" };

    await db.advocacyIssue.delete({ where: { id: issue.id } });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.issue.delete",
      entity: "AdvocacyIssue",
      entityId: issue.id,
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    revalidatePath(`/${orgSlug}/enterprise/advocacy/issues`);
    if (issue.publicSlug) {
      revalidatePath(`/${orgSlug}/advocacy/issues/${issue.publicSlug}`);
    }
    return { ok: true, data: { id: issue.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createAdvocacyCampaign(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = campaignInputSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid campaign" };

    const db = getOrgDb(staff.orgId);
    if (parsed.data.issueId) {
      const issue = await db.advocacyIssue.findUnique({ where: { id: parsed.data.issueId } });
      if (!issue || issue.orgId !== staff.orgId) return { ok: false, error: "Issue not found" };
    }

    const hospitalTarget = await db.memberOrganization.count({ where: { orgId: staff.orgId } });

    const created = await db.advocacyCampaign.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name,
        issueId: parsed.data.issueId ?? null,
        targetCount: hospitalTarget,
        isActive: true,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.campaign.create",
      entity: "AdvocacyCampaign",
      entityId: created.id,
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Creates Engage audience for active members and links campaign for outreach. */
export async function launchAdvocacyTakeAction(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ audienceId: string }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = launchSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid launch request" };

    const db = getOrgDb(staff.orgId);
    const campaign = await db.advocacyCampaign.findUnique({
      where: { id: parsed.data.campaignId },
      include: { issue: true },
    });
    if (!campaign || campaign.orgId !== staff.orgId) {
      return { ok: false, error: "Campaign not found" };
    }
    if (campaign.audienceId) {
      return { ok: false, error: "Take-action already launched for this campaign" };
    }

    const hospitalTarget = await db.memberOrganization.count({ where: { orgId: staff.orgId } });
    const issueLabel = campaign.issue?.title ?? campaign.name;

    const audience = await db.emailAudience.create({
      data: {
        orgId: staff.orgId,
        name: `Advocacy · ${campaign.name}`.slice(0, 120),
        description: `Take-action audience for ${issueLabel}`,
        filter: { status: "ACTIVE" },
      },
    });

    await db.advocacyCampaign.update({
      where: { id: campaign.id },
      data: {
        audienceId: audience.id,
        targetCount: hospitalTarget > 0 ? hospitalTarget : campaign.targetCount,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.campaign.launch",
      entity: "AdvocacyCampaign",
      entityId: campaign.id,
      diff: { audienceId: audience.id },
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    revalidatePath(`/${orgSlug}/engage`);
    return { ok: true, data: { audienceId: audience.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Staff-recorded hospital/facility response (alpha — future public form capture). */
export async function recordAdvocacyResponse(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ responseCount: number }>> {
  try {
    const staff = await requireCapability("advocacy:write", { orgSlug });
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid response" };

    const db = getOrgDb(staff.orgId);
    const campaign = await db.advocacyCampaign.findUnique({
      where: { id: parsed.data.campaignId },
    });
    if (!campaign || campaign.orgId !== staff.orgId) {
      return { ok: false, error: "Campaign not found" };
    }

    const target = campaign.targetCount > 0 ? campaign.targetCount : 1_000_000;
    const next = Math.min(campaign.responseCount + parsed.data.increment, target);

    const updated = await db.advocacyCampaign.update({
      where: { id: campaign.id },
      data: { responseCount: next },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "advocacy.campaign.response",
      entity: "AdvocacyCampaign",
      entityId: campaign.id,
      diff: { increment: parsed.data.increment, responseCount: next },
    });

    revalidatePath(`/${orgSlug}/enterprise/advocacy`);
    return { ok: true, data: { responseCount: updated.responseCount } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
