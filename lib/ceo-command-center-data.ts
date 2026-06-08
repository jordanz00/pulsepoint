/**
 * CEO Command Center — live org metrics for executive briefing (no invented numbers).
 */
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { buildOrgInsights } from "@/lib/intelligence/build-org-insights";
import type { InsightPriority } from "@/lib/intelligence/types";
import { loadOverviewCharts, loadOverviewDashboard } from "@/lib/overview-dashboard-data";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import type { ChartPoint } from "@/lib/motion/chart-samples";

export type CeoReviewItem = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  summary: string;
  href: string;
};

export type CeoEventHighlight = {
  id: string;
  title: string;
  registrations: number;
  capacity: number | null;
  fillPct: number | null;
  startsAt: Date;
};

export type CeoCommitteeAlert = {
  id: string;
  name: string;
  memberCount: number;
  reason: string;
};

export type CeoAdvocacyIssue = {
  id: string;
  title: string;
  status: string;
  jurisdiction: string;
  activeCampaigns: number;
  publicSlug: string | null;
};

export type CeoCommandCenterData = {
  orgName: string;
  dataAsOf: Date;
  members: {
    total: number;
    joinedThisMonth: number;
    growthDelta: number;
    atRisk: number;
    lapsed: number;
    renewalsDue30: number;
    trend: ChartPoint[];
  };
  revenue: {
    mtdCents: number;
    deltaPct: number | null;
    atRiskMemberCount: number;
    trend: ChartPoint[];
    duesPct: number;
    nonDuesPct: number;
  };
  events: {
    published: number;
    upcoming: number;
    highlights: CeoEventHighlight[];
  };
  committees: {
    total: number;
    alerts: CeoCommitteeAlert[];
  };
  advocacy: {
    activeCount: number;
    issues: CeoAdvocacyIssue[];
  };
  executiveReview: CeoReviewItem[];
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toCeoPriority(p: InsightPriority): CeoReviewItem["priority"] {
  if (p === "urgent") return "high";
  if (p === "important") return "medium";
  return "low";
}

async function loadMembershipTrend(orgId: string): Promise<ChartPoint[]> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const points: ChartPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = await db.member.count({
      where: { joinedAt: { gte: start, lt: end } },
    });
    points.push({
      label: MONTH_LABELS[start.getMonth()] ?? "",
      value: count,
    });
  }
  return points;
}

export async function loadCeoCommandCenter(
  orgId: string,
  orgSlug: string,
  orgName: string,
): Promise<CeoCommandCenterData> {
  const db = getOrgDb(orgId);
  const base = `/${orgSlug}`;
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [{ stats, charts }, executive, memberTrend, joinedThisMonth, committees, advocacyIssues, intelligence] =
    await Promise.all([
      loadOverviewDashboard(orgId),
      loadExecutiveDashboard(orgId),
      loadMembershipTrend(orgId),
      db.member.count({ where: { joinedAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
      db.committee.findMany({
        where: { orgId, isActive: true },
        include: {
          _count: { select: { memberships: true } },
        },
        orderBy: { name: "asc" },
      }),
      db.advocacyIssue.findMany({
        where: { orgId, status: { in: ["ACTIVE", "TRACKING"] } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          campaigns: { where: { isActive: true }, select: { id: true } },
        },
      }),
      buildOrgInsights(orgId, orgSlug),
    ]);

  const renewalDue = executive.kpis.find((k) => k.id === "members.renewal_due_30")?.value ?? 0;
  const atRisk = stats.atRiskMembers;
  const lapsed = executive.kpis.find((k) => k.id === "members.lapsed")?.value ?? 0;
  const atRiskMemberCount = renewalDue + atRisk + lapsed;

  const eventsWithRegs = await db.event.findMany({
    where: { orgId, status: "PUBLISHED" },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { startsAt: "desc" },
    take: 20,
  });

  const highlights: CeoEventHighlight[] = eventsWithRegs
    .map((e) => {
      const registrations = e._count.registrations;
      const fillPct =
        e.capacity && e.capacity > 0 ? Math.round((registrations / e.capacity) * 100) : null;
      return {
        id: e.id,
        title: e.title,
        registrations,
        capacity: e.capacity,
        fillPct,
        startsAt: e.startsAt,
      };
    })
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 4);

  const committeeAlerts: CeoCommitteeAlert[] = committees
    .filter((c) => c._count.memberships === 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      memberCount: 0,
      reason: "No members assigned",
    }));

  const thinCommittees = committees.filter(
    (c) => c._count.memberships > 0 && c._count.memberships < 3,
  );
  for (const c of thinCommittees.slice(0, 3)) {
    committeeAlerts.push({
      id: c.id,
      name: c.name,
      memberCount: c._count.memberships,
      reason: "Below minimum roster (3)",
    });
  }

  const executiveReview: CeoReviewItem[] = intelligence.insights.map((insight) => ({
    id: insight.id,
    priority: toCeoPriority(insight.priority),
    title: insight.title,
    summary: insight.action,
    href: insight.href,
  }));

  return {
    orgName,
    dataAsOf: now,
    members: {
      total: stats.membersTotal,
      joinedThisMonth,
      growthDelta: stats.membersDelta,
      atRisk,
      lapsed,
      renewalsDue30: renewalDue,
      trend: memberTrend,
    },
    revenue: {
      mtdCents: stats.revenueMtdCents,
      deltaPct: stats.revenueDeltaPct,
      atRiskMemberCount,
      trend: charts.revenueTrend,
      duesPct: charts.duesPct,
      nonDuesPct: charts.nonDuesPct,
    },
    events: {
      published: stats.eventsTotal,
      upcoming: stats.upcomingEvents,
      highlights,
    },
    committees: {
      total: committees.length,
      alerts: committeeAlerts.slice(0, 5),
    },
    advocacy: {
      activeCount: advocacyIssues.length,
      issues: advocacyIssues.map((i) => ({
        id: i.id,
        title: i.title,
        status: i.status,
        jurisdiction: i.jurisdiction,
        activeCampaigns: i.campaigns.length,
        publicSlug: i.publicSlug,
      })),
    },
    executiveReview: executiveReview.slice(0, 8),
  };
}
