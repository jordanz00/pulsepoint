"use server";

/**
 * Engagement scoring — recompute member scores and sync badges.
 */

import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { recomputeMemberPulse, recomputeOrgMemberPulse } from "@/app/actions/member-pulse";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function recomputeMemberEngagement(
  orgSlug: string,
  memberId: string,
): Promise<ActionResult<{ overall: number; tier: string }>> {
  return recomputeMemberPulse(orgSlug, memberId);
}

export async function recomputeOrgEngagement(orgSlug: string): Promise<ActionResult<{ count: number }>> {
  return recomputeOrgMemberPulse(orgSlug);
}

export async function listEngagementSummary(orgSlug: string) {
  const staff = await requireCapability("member:read", { orgSlug });
  const db = getOrgDb(staff.orgId);
  const [active, moderate, atRisk, inactive] = await Promise.all([
    db.member.count({ where: { orgId: staff.orgId, engagementTier: "active" } }),
    db.member.count({ where: { orgId: staff.orgId, engagementTier: "moderate" } }),
    db.member.count({ where: { orgId: staff.orgId, engagementTier: "at_risk" } }),
    db.member.count({ where: { orgId: staff.orgId, engagementTier: "inactive" } }),
  ]);
  return { active, moderate, atRisk, inactive };
}
