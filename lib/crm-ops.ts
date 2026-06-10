/**
 * CRM ops snapshot — relationship queue, pipeline, and operator briefing (real DB only).
 */

import { getOrgDb } from "@/lib/db";
import { findDuplicateGroups } from "@/lib/crm/unify";

export type CrmFollowUpRow = {
  id: string;
  name: string;
  nextFollowUpAt: Date;
  relationshipHealth: string;
};

export type CrmOpsSnapshot = {
  dataAsOf: Date;
  activeMembers: number;
  hospitalAccounts: number;
  followUpsDue7d: number;
  overdueFollowUps: number;
  atRiskCount: number;
  duplicateGroups: number;
  activeWorkflows: number;
  activeWorkflowRuns: number;
  openDeals: number;
  openPipelineValueCents: number;
  upcomingFollowUps: CrmFollowUpRow[];
  atRiskPreview: CrmFollowUpRow[];
};

export type CrmOpsCard = {
  id: string;
  question: string;
  answer: string;
  href?: string;
  tone?: "neutral" | "attention" | "clear";
};

export type CrmOperatorPanel = {
  id: string;
  title: string;
  value: string;
  detail: string;
  href: string;
  status: "clear" | "watch" | "action";
};

export type CrmRelationshipItem = {
  id: string;
  name: string;
  detail: string;
  href: string;
  priority: "high" | "medium" | "low";
};

/** Live CRM counts from org DB. */
export async function loadCrmOpsSnapshot(orgId: string): Promise<CrmOpsSnapshot> {
  const db = getOrgDb(orgId);
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 86400000);

  const [
    activeMembers,
    hospitalAccounts,
    followUpsDue7d,
    overdueFollowUps,
    atRiskCount,
    activeWorkflows,
    activeWorkflowRuns,
    openDealsAgg,
    duplicates,
    upcomingFollowUps,
    atRiskPreview,
  ] = await Promise.all([
    db.member.count({ where: { orgId, status: "ACTIVE" } }),
    db.memberOrganization.count({ where: { orgId } }),
    db.member.count({
      where: { orgId, status: "ACTIVE", nextFollowUpAt: { lte: weekAhead, not: null } },
    }),
    db.member.count({
      where: { orgId, status: "ACTIVE", nextFollowUpAt: { lt: now, not: null } },
    }),
    db.member.count({ where: { orgId, status: "ACTIVE", relationshipHealth: "AT_RISK" } }),
    db.crmWorkflow.count({ where: { orgId, active: true } }),
    db.crmWorkflowRun.count({ where: { orgId, status: "ACTIVE" } }),
    db.deal.aggregate({
      where: { orgId, closedAt: null, stage: { notIn: ["WON", "LOST"] } },
      _count: true,
      _sum: { amountCents: true },
    }),
    findDuplicateGroups(orgId),
    db.member.findMany({
      where: {
        orgId,
        status: "ACTIVE",
        nextFollowUpAt: { lte: weekAhead, not: null },
      },
      orderBy: { nextFollowUpAt: "asc" },
      take: 6,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nextFollowUpAt: true,
        relationshipHealth: true,
      },
    }),
    db.member.findMany({
      where: { orgId, status: "ACTIVE", relationshipHealth: "AT_RISK" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nextFollowUpAt: true,
        relationshipHealth: true,
      },
    }),
  ]);

  const mapRow = (m: {
    id: string;
    firstName: string;
    lastName: string;
    nextFollowUpAt: Date | null;
    relationshipHealth: string;
  }): CrmFollowUpRow => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`.trim(),
    nextFollowUpAt: m.nextFollowUpAt ?? now,
    relationshipHealth: m.relationshipHealth,
  });

  return {
    dataAsOf: now,
    activeMembers,
    hospitalAccounts,
    followUpsDue7d,
    overdueFollowUps,
    atRiskCount,
    duplicateGroups: duplicates.length,
    activeWorkflows,
    activeWorkflowRuns,
    openDeals: openDealsAgg._count,
    openPipelineValueCents: openDealsAgg._sum.amountCents ?? 0,
    upcomingFollowUps: upcomingFollowUps
      .filter((m) => m.nextFollowUpAt)
      .map((m) => mapRow(m)),
    atRiskPreview: atRiskPreview.map((m) => mapRow(m)),
  };
}

function fmtUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtAsOf(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function buildCrmOpsCards(snapshot: CrmOpsSnapshot, orgSlug: string): CrmOpsCard[] {
  const base = `/${orgSlug}`;
  const attention: string[] = [];
  if (snapshot.overdueFollowUps > 0) {
    attention.push(`${snapshot.overdueFollowUps} overdue follow-up${snapshot.overdueFollowUps === 1 ? "" : "s"}`);
  }
  if (snapshot.atRiskCount > 0) {
    attention.push(`${snapshot.atRiskCount} at-risk relationship${snapshot.atRiskCount === 1 ? "" : "s"}`);
  }
  if (snapshot.duplicateGroups > 0) {
    attention.push(`${snapshot.duplicateGroups} duplicate group${snapshot.duplicateGroups === 1 ? "" : "s"} to merge`);
  }

  return [
    {
      id: "happening",
      question: "What is happening?",
      answer: `${snapshot.activeMembers} active members · ${snapshot.hospitalAccounts} hospital accounts · ${snapshot.openDeals} open partnership deals (${fmtUsd(snapshot.openPipelineValueCents)})`,
      tone: "neutral",
    },
    {
      id: "attention",
      question: "What needs attention?",
      answer:
        attention.length > 0
          ? attention.join(" · ")
          : "Relationship health within normal thresholds — no urgent CRM queues",
      href: attention.length > 0 ? `${base}/crm` : `${base}/members`,
      tone: attention.length > 0 ? "attention" : "clear",
    },
    {
      id: "blocked",
      question: "What is blocked?",
      answer:
        snapshot.duplicateGroups > 0
          ? `${snapshot.duplicateGroups} duplicate contact groups may block clean outreach`
          : "No data-quality blocks — roster ready for Engage and workflows",
      href: snapshot.duplicateGroups > 0 ? `${base}/crm/unify` : undefined,
      tone: snapshot.duplicateGroups > 0 ? "attention" : "clear",
    },
    {
      id: "changed",
      question: "What changed?",
      answer: `${snapshot.activeWorkflowRuns} active workflow runs · ${snapshot.followUpsDue7d} follow-ups due in 7 days · data as of ${fmtAsOf(snapshot.dataAsOf)}`,
      tone: "neutral",
    },
    {
      id: "next",
      question: "What should happen next?",
      answer:
        snapshot.overdueFollowUps > 0
          ? "Work overdue follow-ups · update relationship health on member profiles"
          : snapshot.openDeals > 0
            ? "Advance partnership pipeline · assign owners on open deals"
            : "Run prospector · review duplicate groups before next campaign",
      href: snapshot.overdueFollowUps > 0
        ? `${base}/members`
        : snapshot.openDeals > 0
          ? `${base}/deals/pipeline`
          : `${base}/crm/prospector`,
      tone: "neutral",
    },
  ];
}

export function buildCrmOperatorPanels(
  snapshot: CrmOpsSnapshot,
  orgSlug: string,
): CrmOperatorPanel[] {
  const base = `/${orgSlug}`;

  return [
    {
      id: "followups",
      title: "Follow-ups",
      value: String(snapshot.followUpsDue7d),
      detail:
        snapshot.overdueFollowUps > 0
          ? `${snapshot.overdueFollowUps} overdue · ${snapshot.followUpsDue7d} due within 7 days`
          : `${snapshot.followUpsDue7d} scheduled in the next 7 days`,
      href: `${base}/members`,
      status: snapshot.overdueFollowUps > 0 ? "action" : snapshot.followUpsDue7d > 0 ? "watch" : "clear",
    },
    {
      id: "atrisk",
      title: "At-risk",
      value: String(snapshot.atRiskCount),
      detail:
        snapshot.atRiskCount > 0
          ? "Members flagged AT_RISK — review before renewal season"
          : "No at-risk flags on active roster",
      href: `${base}/members`,
      status: snapshot.atRiskCount > 0 ? "action" : "clear",
    },
    {
      id: "pipeline",
      title: "Pipeline",
      value: String(snapshot.openDeals),
      detail: `${fmtUsd(snapshot.openPipelineValueCents)} open partnership value`,
      href: `${base}/deals/pipeline`,
      status: snapshot.openDeals > 0 ? "watch" : "clear",
    },
    {
      id: "inbox",
      title: "Engage",
      value: String(snapshot.activeWorkflowRuns),
      detail: `${snapshot.activeWorkflows} workflows · ${snapshot.activeWorkflowRuns} active runs`,
      href: `${base}/engage`,
      status: snapshot.activeWorkflowRuns > 0 ? "watch" : "clear",
    },
  ];
}

export function buildCrmRelationshipQueue(snapshot: CrmOpsSnapshot, orgSlug: string): CrmRelationshipItem[] {
  const base = `/${orgSlug}`;
  const items: CrmRelationshipItem[] = [];

  for (const m of snapshot.atRiskPreview) {
    items.push({
      id: `risk-${m.id}`,
      name: m.name,
      detail: "At-risk relationship — review renewal and engagement",
      href: `${base}/members/${m.id}`,
      priority: "high",
    });
  }

  const now = Date.now();
  for (const m of snapshot.upcomingFollowUps) {
    if (items.some((i) => i.id === `risk-${m.id}`)) continue;
    const overdue = m.nextFollowUpAt.getTime() < now;
    items.push({
      id: `fu-${m.id}`,
      name: m.name,
      detail: overdue
        ? `Follow-up overdue · was due ${m.nextFollowUpAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : `Follow-up ${m.nextFollowUpAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      href: `${base}/members/${m.id}`,
      priority: overdue ? "high" : "medium",
    });
  }

  if (snapshot.duplicateGroups > 0) {
    items.push({
      id: "duplicates",
      name: "Duplicate contact groups",
      detail: `${snapshot.duplicateGroups} group${snapshot.duplicateGroups === 1 ? "" : "s"} need merge review`,
      href: `${base}/crm/unify`,
      priority: "medium",
    });
  }

  return items.slice(0, 8);
}
