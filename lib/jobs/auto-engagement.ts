/**
 * Auto engagement — recompute score after member activity (no manual refresh).
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { getOrgDb } from "@/lib/db";
import { badgesForScore } from "@/lib/engagement-score";
import { computeMemberPulse } from "@/lib/member-pulse/compute";

export async function autoRecomputeEngagement(orgId: string, memberId: string): Promise<void> {
  const pulse = await computeMemberPulse(orgId, memberId);
  if (!pulse) return;

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
}
