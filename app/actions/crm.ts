"use server";

/**
 * PulsePoint CRM — relationship-first actions (Nimble-inspired pillars).
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { memberTagsJson } from "@/lib/member-tags";
import { ensureDefaultCrmWorkflows as ensureWorkflowTemplates } from "@/app/actions/crm-workflows";
import { suggestEnrichment } from "@/lib/crm/enrichment";
import { enrichProspect } from "@/lib/crm/prospector-enrichment";
import { findDuplicateGroups, listContactSourceSummary } from "@/lib/crm/unify";
import { generateCaptureToken, hashCaptureToken } from "@/lib/crm/web-capture";
import {
  memberCrmProfileSchema,
  memberRelationshipSchema,
  webCaptureInputSchema,
} from "@/lib/validations/crm";
import type { ActionResult } from "@/app/actions/members";

export async function ensureDefaultCrmWorkflows(orgSlug?: string): Promise<ActionResult> {
  return ensureWorkflowTemplates(orgSlug);
}

export async function getCrmDashboard(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const [followUps, atRisk, workflows, sources, duplicates] = await Promise.all([
      db.member.count({
        where: { nextFollowUpAt: { lte: new Date(Date.now() + 7 * 86400000) } },
      }),
      db.member.count({ where: { relationshipHealth: "AT_RISK" } }),
      db.crmWorkflow.count({ where: { active: true } }),
      listContactSourceSummary(staff.orgId),
      findDuplicateGroups(staff.orgId),
    ]);
    return {
      ok: true as const,
      data: {
        followUpsDue: followUps,
        atRiskCount: atRisk,
        activeWorkflows: workflows,
        sources,
        duplicateGroups: duplicates.length,
      },
    };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function listCrmWorkflows(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const workflows = await db.crmWorkflow.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { runs: true } } },
    });
    return { ok: true as const, data: { workflows } };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function listCrmWorkflowRuns(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const runs = await db.crmWorkflowRun.findMany({
      where: { status: "ACTIVE" },
      orderBy: { dueAt: "asc" },
      take: 50,
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        workflow: { select: { name: true, kind: true, steps: true } },
      },
    });
    return { ok: true as const, data: { runs } };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function updateMemberCrmProfile(
  memberId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberCrmProfileSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid profile data" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.member.findFirst({ where: { id: memberId } });
    if (!existing) return { ok: false, error: "Member not found" };

    const d = parsed.data;
    await db.member.update({
      where: { id: memberId },
      data: {
        company: d.company || null,
        jobTitle: d.jobTitle || null,
        linkedInUrl: d.linkedInUrl || null,
        websiteUrl: d.websiteUrl || null,
        relationshipHealth: d.relationshipHealth ?? existing.relationshipHealth,
        nextFollowUpAt: d.nextFollowUpAt ? new Date(d.nextFollowUpAt) : existing.nextFollowUpAt,
      },
    });

    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function getMemberEnrichmentSuggestions(memberId: string, orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false as const, error: "Member not found" };

    return {
      ok: true as const,
      data: { suggestions: suggestEnrichment(member) },
    };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function addMemberRelationship(
  fromMemberId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = memberRelationshipSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid relationship" };

    const db = getOrgDb(staff.orgId);
    if (fromMemberId === parsed.data.toMemberId) {
      return { ok: false, error: "Cannot link a member to themselves" };
    }

    await db.memberRelationship.create({
      data: {
        orgId: staff.orgId,
        fromMemberId,
        toMemberId: parsed.data.toMemberId,
        relationType: parsed.data.relationType,
        strength: parsed.data.strength ?? 3,
        notes: parsed.data.notes ?? "",
      },
    });

    revalidatePath(`/${staff.orgSlug}/members/${fromMemberId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function listMemberRelationships(memberId: string, orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const rows = await db.memberRelationship.findMany({
      where: {
        OR: [{ fromMemberId: memberId }, { toMemberId: memberId }],
      },
      include: {
        fromMember: { select: { id: true, firstName: true, lastName: true } },
        toMember: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return { ok: true as const, data: { relationships: rows } };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function listDuplicateGroups(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const groups = await findDuplicateGroups(staff.orgId);
    const sources = await listContactSourceSummary(staff.orgId);
    return { ok: true as const, data: { groups, sources } };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function recordContactSource(
  memberId: string,
  sourceKind: "MANUAL" | "CSV_IMPORT" | "EMAIL_CAPTURE" | "WEB_CAPTURE" | "LINKEDIN" | "DIRECTORY",
  label: string,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.contactSource.create({
      data: { orgId: staff.orgId, memberId, sourceKind, label },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createWebCaptureKey(orgSlug?: string): Promise<
  ActionResult<{ token: string; label: string }>
> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const { token, keyHash } = generateCaptureToken();
    await db.webCaptureKey.create({
      data: { orgId: staff.orgId, keyHash, label: "Browser capture" },
    });
    revalidatePath(`/${staff.orgSlug}/crm/everywhere`);
    return { ok: true, data: { token, label: "Browser capture" } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Public capture — called from API route with token. */
export async function captureContactFromWeb(
  orgId: string,
  token: string,
  raw: unknown,
): Promise<ActionResult<{ memberId: string }>> {
  const parsed = webCaptureInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid capture payload" };

  const db = getOrgDb(orgId);
  const keyHash = hashCaptureToken(token);
  const key = await db.webCaptureKey.findFirst({
    where: { keyHash, active: true },
  });
  if (!key) return { ok: false, error: "Invalid capture key" };

  const input = parsed.data;
  const email = input.email?.trim().toLowerCase() || null;

  let member =
    email != null
      ? await db.member.findFirst({ where: { email } })
      : null;

  if (!member) {
    member = await db.member.create({
      data: {
        orgId,
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone || null,
        company: input.company || null,
        jobTitle: input.jobTitle || null,
        linkedInUrl: input.linkedInUrl || null,
        websiteUrl: input.websiteUrl || null,
        tags: memberTagsJson([]) as Prisma.InputJsonValue,
        customFields: {} as Prisma.InputJsonValue,
        enrichmentData: enrichProspect({
          firstName: input.firstName,
          lastName: input.lastName,
          email,
          company: input.company,
          jobTitle: input.jobTitle,
          linkedInUrl: input.linkedInUrl,
          websiteUrl: input.websiteUrl,
        }) as unknown as Prisma.InputJsonValue,
        lastTouchAt: new Date(),
      },
    });
  } else {
    const firmographics = enrichProspect({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      company: input.company || member.company,
      jobTitle: input.jobTitle || member.jobTitle,
      linkedInUrl: input.linkedInUrl || member.linkedInUrl,
      websiteUrl: input.websiteUrl || member.websiteUrl,
    });
    await db.member.update({
      where: { id: member.id },
      data: {
        company: input.company || member.company,
        jobTitle: input.jobTitle || member.jobTitle,
        linkedInUrl: input.linkedInUrl || member.linkedInUrl,
        websiteUrl: input.websiteUrl || member.websiteUrl,
        enrichmentData: firmographics as unknown as Prisma.InputJsonValue,
        lastTouchAt: new Date(),
      },
    });
  }

  await db.contactSource.create({
    data: {
      orgId,
      memberId: member.id,
      sourceKind: input.captureKind,
      label: input.sourceLabel || "Web capture",
    },
  });

  return { ok: true, data: { memberId: member.id } };
}

export async function listFollowUps(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const members = await db.member.findMany({
      where: { nextFollowUpAt: { not: null } },
      orderBy: { nextFollowUpAt: "asc" },
      take: 30,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nextFollowUpAt: true,
        relationshipHealth: true,
      },
    });
    return { ok: true as const, data: { members } };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}
