import { getOrgDb } from "@/lib/db";
import type { EngagementTier } from "@/lib/engagement-score";
import { MEMBER_PULSE_DIMENSION_IDS } from "@/lib/member-pulse/types";
import type { MemberPulseOrgSummary } from "@/lib/member-pulse/types";
import { parseMemberPulseSnapshot } from "@/lib/member-pulse/compute";

export async function loadMemberPulseOrgSummary(orgId: string): Promise<MemberPulseOrgSummary> {
  const db = getOrgDb(orgId);
  const members = await db.member.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      engagementScore: true,
      engagementTier: true,
      memberPulseData: true,
    },
    take: 500,
  });

  const averages = Object.fromEntries(
    MEMBER_PULSE_DIMENSION_IDS.map((id) => [id, 0]),
  ) as Record<(typeof MEMBER_PULSE_DIMENSION_IDS)[number], number>;

  const tierCounts: Record<EngagementTier, number> = {
    active: 0,
    moderate: 0,
    at_risk: 0,
    inactive: 0,
  };

  let countWithPulse = 0;
  for (const m of members) {
    const tier = (m.engagementTier as EngagementTier) || "inactive";
    if (tier in tierCounts) tierCounts[tier] += 1;

    const pulse = parseMemberPulseSnapshot(m.memberPulseData);
    if (!pulse) continue;
    countWithPulse += 1;
    for (const d of pulse.dimensions) {
      averages[d.id] += d.score;
    }
  }

  if (countWithPulse > 0) {
    for (const id of MEMBER_PULSE_DIMENSION_IDS) {
      averages[id] = Math.round(averages[id] / countWithPulse);
    }
  }

  const topChampions = members
    .map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      overall: parseMemberPulseSnapshot(m.memberPulseData)?.overall ?? m.engagementScore,
    }))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 8);

  return {
    averages,
    tierCounts,
    totalMembers: members.length,
    topChampions,
  };
}
