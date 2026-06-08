/**
 * Nightly engagement sweep — recompute scores for all active members in an org.
 */

import { getOrgDb } from "@/lib/db";
import { autoRecomputeEngagement } from "@/lib/jobs/auto-engagement";

export async function runEngagementSweep(orgId: string): Promise<{ count: number }> {
  const db = getOrgDb(orgId);
  const members = await db.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
    take: 1000,
  });

  for (const m of members) {
    await autoRecomputeEngagement(orgId, m.id);
  }

  return { count: members.length };
}
