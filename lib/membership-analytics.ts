/**
 * Membership analytics — real org-scoped metrics for hospital & health system associations.
 * All values computed from live tenant data (no invented numbers).
 */

import { getOrgDb } from "@/lib/db";
import { ENGAGEMENT_TIER_LABEL, type EngagementTier } from "@/lib/engagement-score";

export type TierBreakdownRow = {
  tierId: string | null;
  tierName: string;
  count: number;
  revenueCents: number;
};

export type EngagementBreakdownRow = {
  tier: EngagementTier;
  label: string;
  count: number;
  pct: number;
};

export type RenewalPipelineRow = {
  label: string;
  count: number;
  windowDays: number | null;
};

export type HospitalAccountRow = {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  region: string | null;
};

export type MembershipAnalytics = {
  dataAsOf: Date;
  totals: {
    all: number;
    active: number;
    inactive: number;
    lapsed: number;
    atRisk: number;
    highlyEngaged: number;
    renewalDue30: number;
    renewalOverdue: number;
    withTier: number;
    hospitalAccounts: number;
    membersOnHospitalRoster: number;
    cSuite: number;
    boardSeats: number;
  };
  engagementBreakdown: EngagementBreakdownRow[];
  tierBreakdown: TierBreakdownRow[];
  renewalPipeline: RenewalPipelineRow[];
  topHospitalAccounts: HospitalAccountRow[];
  recentJoins30: number;
  retentionRatePct: number | null;
};

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function loadMembershipAnalytics(orgId: string): Promise<MembershipAnalytics> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const in30 = daysFromNow(30);
  const joined30Ago = new Date(now);
  joined30Ago.setDate(joined30Ago.getDate() - 30);

  const [
    all,
    active,
    inactive,
    lapsed,
    atRisk,
    highlyEngaged,
    renewalDue30,
    renewalOverdue,
    withTier,
    hospitalAccounts,
    membersOnHospitalRoster,
    roles,
    recentJoins30,
    tierGroups,
    hospitalRows,
  ] = await Promise.all([
    db.member.count(),
    db.member.count({ where: { status: "ACTIVE" } }),
    db.member.count({ where: { status: "INACTIVE" } }),
    db.member.count({ where: { status: "LAPSED" } }),
    db.member.count({ where: { engagementTier: "at_risk" } }),
    db.member.count({ where: { engagementTier: "active" } }),
    db.member.count({
      where: {
        status: "ACTIVE",
        renewalDueAt: { gte: now, lte: in30 },
      },
    }),
    db.member.count({
      where: {
        status: "ACTIVE",
        renewalDueAt: { lt: now },
      },
    }),
    db.member.count({ where: { tierId: { not: null } } }),
    db.memberOrganization.count(),
    db.member.count({ where: { organizationAccountId: { not: null } } }),
    db.memberRole.findMany({
      where: { isCurrent: true },
      select: { category: true, leadershipLevel: true },
    }),
    db.member.count({ where: { joinedAt: { gte: joined30Ago } } }),
    db.member.groupBy({
      by: ["tierId"],
      _count: { _all: true },
      where: { tierId: { not: null } },
    }),
    db.memberOrganization.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        type: true,
        region: true,
        _count: { select: { members: true } },
      },
    }),
  ]);

  let cSuite = 0;
  let boardSeats = 0;
  for (const r of roles) {
    if (r.leadershipLevel === "C_SUITE") cSuite += 1;
    if (r.category === "BOARD") boardSeats += 1;
  }

  const tiers = await db.memberTier.findMany({ where: { orgId } });
  const tierNameById = Object.fromEntries(tiers.map((t) => [t.id, t.name]));
  const tierPriceById = Object.fromEntries(tiers.map((t) => [t.id, t.priceCents]));

  const tierBreakdown: TierBreakdownRow[] = tierGroups.map((g) => ({
    tierId: g.tierId,
    tierName: g.tierId ? (tierNameById[g.tierId] ?? "Tier") : "Unassigned",
    count: g._count._all,
    revenueCents:
      g.tierId && tierPriceById[g.tierId]
        ? tierPriceById[g.tierId] * g._count._all
        : 0,
  }));

  const engagementTiers: EngagementTier[] = ["active", "moderate", "at_risk", "inactive"];
  const engagementCounts = await Promise.all(
    engagementTiers.map((tier) =>
      db.member.count({ where: { engagementTier: tier } }),
    ),
  );
  const engagementBreakdown: EngagementBreakdownRow[] = engagementTiers.map((tier, i) => ({
    tier,
    label: ENGAGEMENT_TIER_LABEL[tier],
    count: engagementCounts[i],
    pct: all > 0 ? Math.round((engagementCounts[i] / all) * 100) : 0,
  }));

  const retentionRatePct =
    all > 0 ? Math.round((active / all) * 1000) / 10 : null;

  return {
    dataAsOf: now,
    totals: {
      all,
      active,
      inactive,
      lapsed,
      atRisk,
      highlyEngaged,
      renewalDue30,
      renewalOverdue,
      withTier,
      hospitalAccounts,
      membersOnHospitalRoster,
      cSuite,
      boardSeats,
    },
    engagementBreakdown,
    tierBreakdown,
    renewalPipeline: [
      { label: "Renewals due in 30 days", count: renewalDue30, windowDays: 30 },
      { label: "Renewal overdue", count: renewalOverdue, windowDays: null },
      { label: "Lapsed — win-back", count: lapsed, windowDays: null },
    ],
    topHospitalAccounts: [...hospitalRows]
      .sort((a, b) => b._count.members - a._count.members)
      .slice(0, 12)
      .map((h) => ({
      id: h.id,
      name: h.name,
      type: h.type,
      memberCount: h._count.members,
      region: h.region,
    })),
    recentJoins30,
    retentionRatePct,
  };
}
