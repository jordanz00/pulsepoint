"use server";

/**
 * MemberPulse — recompute and persist dimensional engagement.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { badgesForScore } from "@/lib/engagement-score";
import { computeMemberPulse, parseMemberPulseSnapshot } from "@/lib/member-pulse/compute";
import type { ActionResult } from "@/app/actions/members";

async function persistMemberPulse(
  orgId: string,
  orgSlug: string,
  memberId: string,
): Promise<{ overall: number; tier: string } | null> {
  const pulse = await computeMemberPulse(orgId, memberId);
  if (!pulse) return null;

  const db = getOrgDb(orgId);
  await db.member.update({
    where: { id: memberId },
    data: {
      memberPulseData: pulse as unknown as Prisma.InputJsonValue,
      engagementScore: pulse.overall,
      engagementTier: pulse.overallTier,
    },
  });

  for (const b of badgesForScore(pulse.overall)) {
    await db.memberBadge.upsert({
      where: { orgId_memberId_code: { orgId, memberId, code: b.code } },
      create: { orgId, memberId, code: b.code, label: b.label },
      update: { label: b.label },
    });
  }

  revalidatePath(`/${orgSlug}/members/${memberId}`);
  revalidatePath(`/${orgSlug}/members`);
  revalidatePath(`/${orgSlug}/members/pulse`);
  return { overall: pulse.overall, tier: pulse.overallTier };
}

export async function recomputeMemberPulse(
  orgSlug: string,
  memberId: string,
): Promise<ActionResult<{ overall: number; tier: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const result = await persistMemberPulse(staff.orgId, staff.orgSlug, memberId);
    if (!result) return { ok: false, error: "Member not found" };
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function recomputeOrgMemberPulse(
  orgSlug: string,
): Promise<ActionResult<{ count: number }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const members = await db.member.findMany({
      where: { orgId: staff.orgId },
      select: { id: true },
      take: 500,
    });

    for (const m of members) {
      await persistMemberPulse(staff.orgId, staff.orgSlug, m.id);
    }

    return { ok: true, data: { count: members.length } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function getMemberPulse(orgSlug: string, memberId: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({
      where: { id: memberId },
      select: { memberPulseData: true, engagementScore: true, engagementTier: true },
    });
    if (!member) return { ok: false as const, error: "Member not found" };

    let pulse = parseMemberPulseSnapshot(member.memberPulseData);
    if (!pulse) {
      pulse = await computeMemberPulse(staff.orgId, memberId);
    }

    return { ok: true as const, data: pulse };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}
