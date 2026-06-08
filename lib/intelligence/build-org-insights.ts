/**
 * AMS Intelligence engine — rule-based insights from live org data.
 */
import { getOrgDb } from "@/lib/db";
import { loadAdvocacyDashboardStats } from "@/lib/advocacy-dashboard";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { loadOverviewDashboard } from "@/lib/overview-dashboard-data";
import { loadOverviewDuesSnapshot } from "@/lib/overview-dues-data";
import {
  INSIGHT_PRIORITY_ORDER,
  type InsightDomain,
  type InsightPriority,
  type OrgInsight,
  type OrgInsightsResult,
} from "@/lib/intelligence/types";

const MAX_INSIGHTS = 8;

function monthBounds(offsetMonths: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 1);
  return { start, end };
}

function pushInsight(
  list: OrgInsight[],
  insight: OrgInsight,
  seen: Set<string>,
) {
  if (seen.has(insight.id)) return;
  seen.add(insight.id);
  list.push(insight);
}

function sortAndCap(insights: OrgInsight[]): OrgInsight[] {
  return [...insights]
    .sort((a, b) => INSIGHT_PRIORITY_ORDER[a.priority] - INSIGHT_PRIORITY_ORDER[b.priority])
    .slice(0, MAX_INSIGHTS);
}

function countByPriority(insights: OrgInsight[]) {
  return {
    urgent: insights.filter((i) => i.priority === "urgent").length,
    important: insights.filter((i) => i.priority === "important").length,
    info: insights.filter((i) => i.priority === "info").length,
  };
}

export function selectTopInsights(insights: OrgInsight[], limit = 3): OrgInsight[] {
  return sortAndCap(insights).slice(0, limit);
}

export async function buildOrgInsights(
  orgId: string,
  orgSlug: string,
): Promise<OrgInsightsResult> {
  const db = getOrgDb(orgId);
  const base = `/${orgSlug}`;
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const thisMonth = monthBounds(0);
  const lastMonth = monthBounds(1);

  const [
    overview,
    executive,
    dues,
    advocacyStats,
    exceptions,
    committees,
    advocacyIssues,
    openDeals,
    sponsorshipProducts,
    regsThisMonth,
    regsLastMonth,
    upcomingSparse,
    recentEvents,
    inactiveMembers,
  ] = await Promise.all([
    loadOverviewDashboard(orgId),
    loadExecutiveDashboard(orgId),
    loadOverviewDuesSnapshot(orgId),
    loadAdvocacyDashboardStats(orgId),
    db.automationException.count({ where: { orgId, resolvedAt: null } }),
    db.committee.findMany({
      where: { orgId, isActive: true },
      include: { _count: { select: { memberships: true } } },
      orderBy: { name: "asc" },
    }),
    db.advocacyIssue.findMany({
      where: { orgId, status: { in: ["ACTIVE", "TRACKING"] } },
      include: { campaigns: { where: { isActive: true }, select: { id: true } } },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    db.deal.count({
      where: {
        orgId,
        stage: { in: ["QUALIFIED", "PROPOSAL", "NEGOTIATION"] },
      },
    }),
    db.commerceProduct.count({
      where: { orgId, active: true, kind: "SPONSORSHIP" },
    }),
    db.eventRegistration.count({
      where: { orgId, createdAt: { gte: thisMonth.start, lt: thisMonth.end } },
    }),
    db.eventRegistration.count({
      where: { orgId, createdAt: { gte: lastMonth.start, lt: lastMonth.end } },
    }),
    db.event.findMany({
      where: { orgId, status: "PUBLISHED", startsAt: { gte: now, lte: in30 } },
      include: { _count: { select: { registrations: true } } },
      orderBy: { startsAt: "asc" },
      take: 20,
    }),
    db.event.findMany({
      where: {
        orgId,
        status: "PUBLISHED",
        startsAt: { lt: now },
      },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          where: { checkedInAt: { not: null } },
          select: { id: true },
        },
      },
      orderBy: { startsAt: "desc" },
      take: 8,
    }),
    db.member.count({ where: { orgId, engagementTier: "inactive", status: "ACTIVE" } }),
  ]);

  const stats = overview.stats;
  const renewalDue =
    executive.kpis.find((k) => k.id === "members.renewal_due_30")?.value ?? 0;
  const lapsed = executive.kpis.find((k) => k.id === "members.lapsed")?.value ?? 0;
  const atRisk = stats.atRiskMembers;

  const insights: OrgInsight[] = [];
  const seen = new Set<string>();

  const add = (
    id: string,
    domain: InsightDomain,
    priority: InsightPriority,
    title: string,
    action: string,
    href: string,
    metricValue?: number,
    metricLabel?: string,
  ) => {
    pushInsight(
      insights,
      { id, domain, priority, title, action, href, metricValue, metricLabel },
      seen,
    );
  };

  // ── Membership retention & renewals ──
  if (atRisk > 0) {
    add(
      "membership-at-risk",
      "membership",
      "urgent",
      `${atRisk} member${atRisk === 1 ? "" : "s"} at retention risk`,
      "Review engagement scores and schedule outreach.",
      `${base}/members?filter=at_risk`,
      atRisk,
      "At-risk",
    );
  }

  if (dues.renewalOverdue > 0) {
    add(
      "membership-overdue",
      "membership",
      "urgent",
      `${dues.renewalOverdue} membership${dues.renewalOverdue === 1 ? "" : "s"} overdue`,
      "Send renewal reminders or direct members to pay online.",
      `${base}/join`,
      dues.renewalOverdue,
      "Overdue",
    );
  }

  if (renewalDue > 0) {
    add(
      "membership-expiring",
      "membership",
      renewalDue >= 10 ? "urgent" : "important",
      `${renewalDue} membership${renewalDue === 1 ? "" : "s"} expiring in 30 days`,
      "Confirm renewal outreach and online pay link.",
      `${base}/join`,
      renewalDue,
      "Due in 30d",
    );
  }

  if (lapsed > 0) {
    add(
      "membership-lapsed",
      "membership",
      "important",
      `${lapsed} lapsed member${lapsed === 1 ? "" : "s"}`,
      "Launch a win-back campaign for former members.",
      `${base}/members`,
      lapsed,
      "Lapsed",
    );
  }

  if (inactiveMembers >= 5) {
    add(
      "membership-inactive",
      "membership",
      "important",
      `${inactiveMembers} active members show no engagement`,
      "Re-engage with events, email, or advocacy content.",
      `${base}/members/pulse`,
      inactiveMembers,
      "Inactive",
    );
  }

  // ── Event attendance trends ──
  const zeroRegUpcoming = upcomingSparse.filter((e) => e._count.registrations === 0);
  if (zeroRegUpcoming.length > 0) {
    add(
      "events-zero-registrations",
      "events",
      "important",
      `${zeroRegUpcoming.length} upcoming event${zeroRegUpcoming.length === 1 ? "" : "s"} with no registrations`,
      "Promote registration before the event date.",
      `${base}/events`,
      zeroRegUpcoming.length,
      "No sign-ups",
    );
  }

  if (regsLastMonth > 0 && regsThisMonth < regsLastMonth * 0.75) {
    const dropPct = Math.round(((regsLastMonth - regsThisMonth) / regsLastMonth) * 100);
    add(
      "events-attendance-trend",
      "events",
      "important",
      `Event registrations down ${dropPct}% vs last month`,
      "Review calendar mix and promotion timing.",
      `${base}/events`,
      dropPct,
      "Decline",
    );
  }

  let lowCheckInEvents = 0;
  for (const e of recentEvents) {
    const regs = e._count.registrations;
    const checked = e.registrations.length;
    if (regs >= 10 && checked / regs < 0.5) lowCheckInEvents++;
  }
  if (lowCheckInEvents > 0) {
    add(
      "events-checkin-rate",
      "events",
      "important",
      `${lowCheckInEvents} recent event${lowCheckInEvents === 1 ? "" : "s"} below 50% check-in`,
      "Improve day-of reminders and on-site check-in flow.",
      `${base}/events`,
      lowCheckInEvents,
      "Low check-in",
    );
  }

  const lowFill = upcomingSparse.filter(
    (e) => e.capacity && e.capacity > 0 && e._count.registrations / e.capacity < 0.25,
  );
  if (lowFill.length > 0) {
    add(
      "events-low-fill",
      "events",
      "info",
      `${lowFill.length} event${lowFill.length === 1 ? "" : "s"} under 25% capacity`,
      "Consider targeted invites or adjusted pricing.",
      `${base}/events`,
      lowFill.length,
      "Low fill",
    );
  }

  // ── Sponsorship opportunities ──
  if (openDeals > 0) {
    add(
      "sponsorship-pipeline",
      "sponsorship",
      openDeals >= 3 ? "important" : "info",
      `${openDeals} sponsorship deal${openDeals === 1 ? "" : "s"} in pipeline`,
      "Advance proposals before quarter close.",
      `${base}/deals/pipeline`,
      openDeals,
      "Open deals",
    );
  } else if (sponsorshipProducts > 0 && stats.revenueMtdCents === 0) {
    add(
      "sponsorship-catalog",
      "sponsorship",
      "info",
      "Sponsorship products live with no revenue this month",
      "Share sponsorship tiers with prospect list.",
      `${base}/commerce`,
      sponsorshipProducts,
      "SKUs",
    );
  }

  if (dues.unpaidInvoiceCount > 0) {
    add(
      "sponsorship-unpaid-dues",
      "membership",
      dues.unpaidInvoiceCount >= 5 ? "urgent" : "important",
      `${dues.unpaidInvoiceCount} unpaid invoice${dues.unpaidInvoiceCount === 1 ? "" : "s"}`,
      "Follow up on pending commerce orders.",
      `${base}/commerce`,
      dues.unpaidInvoiceCount,
      "Unpaid",
    );
  }

  // ── Advocacy engagement ──
  const activeNoCampaign = advocacyIssues.filter(
    (i) => i.status === "ACTIVE" && i.campaigns.length === 0,
  );
  if (activeNoCampaign.length > 0) {
    add(
      "advocacy-no-campaign",
      "advocacy",
      "important",
      `${activeNoCampaign.length} active issue${activeNoCampaign.length === 1 ? "" : "s"} without a campaign`,
      "Launch a take-action campaign for member outreach.",
      `${base}/enterprise/advocacy`,
      activeNoCampaign.length,
      "No campaign",
    );
  }

  if (
    advocacyStats.hospitalAccounts > 0 &&
    advocacyStats.hospitalEngagementPct < 50
  ) {
    add(
      "advocacy-hospital-engagement",
      "advocacy",
      "important",
      `Hospital engagement at ${advocacyStats.hospitalEngagementPct}%`,
      "Target under-engaged hospital accounts for advocacy alerts.",
      `${base}/enterprise/advocacy`,
      advocacyStats.hospitalEngagementPct,
      "Engagement",
    );
  }

  const trackingIssues = advocacyIssues.filter((i) => i.status === "TRACKING");
  if (trackingIssues.length >= 3) {
    add(
      "advocacy-tracking-backlog",
      "advocacy",
      "info",
      `${trackingIssues.length} policy issues in tracking`,
      "Prioritize which bills need member activation.",
      `${base}/enterprise/advocacy`,
      trackingIssues.length,
      "Tracking",
    );
  }

  // ── Committee participation ──
  const emptyCommittees = committees.filter((c) => c._count.memberships === 0);
  if (emptyCommittees.length > 0) {
    add(
      "committees-empty",
      "committees",
      "important",
      `${emptyCommittees.length} committee${emptyCommittees.length === 1 ? "" : "s"} with no members`,
      "Assign roster seats before the next board cycle.",
      `${base}/committees`,
      emptyCommittees.length,
      "Empty",
    );
  }

  const thinCommittees = committees.filter(
    (c) => c._count.memberships > 0 && c._count.memberships < 3,
  );
  if (thinCommittees.length > 0) {
    add(
      "committees-thin",
      "committees",
      "info",
      `${thinCommittees.length} committee${thinCommittees.length === 1 ? "" : "s"} below minimum roster`,
      "Recruit volunteers to reach quorum-ready membership.",
      `${base}/committees`,
      thinCommittees.length,
      "Thin roster",
    );
  }

  // ── Operations ──
  if (exceptions > 0) {
    add(
      "ops-exceptions",
      "operations",
      "urgent",
      `${exceptions} automation exception${exceptions === 1 ? "" : "s"}`,
      "Resolve failed workflows in the exceptions queue.",
      `${base}/exceptions`,
      exceptions,
      "Open",
    );
  }

  const capped = sortAndCap(insights);

  if (capped.length === 0) {
    capped.push({
      id: "all-clear",
      domain: "operations",
      priority: "info",
      title: "No urgent actions detected",
      action: "Membership, events, and governance signals look stable.",
      href: base,
    });
  }

  return {
    dataAsOf: now,
    insights: capped,
    counts: countByPriority(capped),
  };
}
