/**
 * MemberEngagementShowcase — server component loading live engagement data per org.
 */

import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import type { EngagementTier } from "@/lib/engagement-score";
import { EngagementMetricsClient } from "./engagement-metrics-client";

type Props = { orgSlug: string };

export async function MemberEngagementShowcase({ orgSlug }: Props) {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [rawTiers, activeCount, sequences, emailsSent] = await Promise.all([
    db.member.groupBy({
      by: ["engagementTier"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
    db.member.count({ where: { status: "ACTIVE" } }),
    db.emailSequence.count({ where: { status: "ACTIVE" } }),
    db.emailSendLog.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const tierOrder: EngagementTier[] = ["active", "moderate", "at_risk", "inactive"];
  const tierCounts = tierOrder.map((tier) => ({
    tier,
    count: rawTiers.find((r) => r.engagementTier === tier)?._count._all ?? 0,
  }));

  const scoreWeights: Record<EngagementTier, number> = {
    active: 80,
    moderate: 45,
    at_risk: 20,
    inactive: 5,
  };

  const totalWeighted = tierCounts.reduce(
    (sum, { tier, count }) => sum + scoreWeights[tier] * count,
    0,
  );
  const overallScore = activeCount > 0 ? Math.round(totalWeighted / activeCount) : 0;

  return (
    <EngagementMetricsClient
      tierCounts={tierCounts}
      totalActive={activeCount}
      overallScore={overallScore}
      sequencesRunning={sequences}
      emailsSentThisMonth={emailsSent}
    />
  );
}
