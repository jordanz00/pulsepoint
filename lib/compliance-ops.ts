/**
 * Compliance & MLR ops snapshot — org DB + optional ad-ops API (real data only).
 */

import { getOrgDb } from "@/lib/db";
import { adOpsApi } from "@/lib/ad-ops-api";

/** Creative MLR lifecycle — mirrors @ams/shared CREATIVE_STATES (no web dependency). */
export const CREATIVE_STATES = [
  "DRAFT",
  "SUBMITTED",
  "MLR_APPROVED",
  "LOCKED",
  "TRAFFICKED",
  "LIVE",
  "RETIRED",
] as const;

export type ComplianceAuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
};

export type AdOpsComplianceSnapshot = {
  campaignsTotal: number;
  campaignsInQa: number;
  pendingQaGates: number;
  pendingAudienceQa: number;
  pendingBudgetQa: number;
  pendingCreativeQa: number;
  recentAudit: Array<{
    id: string;
    entityType: string;
    action: string;
    createdAt: string;
    actorEmail: string | null;
  }>;
};

export type ComplianceOpsSnapshot = {
  dataAsOf: Date;
  pendingImportBatches: number;
  openExceptions: number;
  auditEntriesLast7Days: number;
  recentAudit: ComplianceAuditRow[];
  adOps: AdOpsComplianceSnapshot | null;
};

export type ComplianceOpsCard = {
  id: string;
  question: string;
  answer: string;
  href?: string;
  tone?: "neutral" | "attention" | "clear";
};

export type ComplianceApprovalItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  status: "action" | "watch" | "clear";
  count?: number;
};

/** Live compliance counts from org DB; ad-ops MLR queue when API reachable. */
export async function loadComplianceOpsSnapshot(orgId: string): Promise<ComplianceOpsSnapshot> {
  const db = getOrgDb(orgId);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [pendingImportBatches, openExceptions, auditEntriesLast7Days, recentAudit, adOps] =
    await Promise.all([
      db.memberImportBatch.count({ where: { orgId, status: "PENDING_REVIEW" } }),
      db.automationException.count({ where: { orgId, resolvedAt: null } }),
      db.auditLog.count({ where: { orgId, createdAt: { gte: weekAgo } } }),
      db.auditLog.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, action: true, entity: true, entityId: true, createdAt: true },
      }),
      loadAdOpsComplianceSnapshot(),
    ]);

  return {
    dataAsOf: new Date(),
    pendingImportBatches,
    openExceptions,
    auditEntriesLast7Days,
    recentAudit,
    adOps,
  };
}

async function loadAdOpsComplianceSnapshot(): Promise<AdOpsComplianceSnapshot | null> {
  try {
    const [campaigns, auditLogs] = await Promise.all([
      adOpsApi<
        Array<{
          id: string;
          name: string;
          state: string;
          audienceQaAt: string | null;
          budgetQaAt: string | null;
          creativeQaAt: string | null;
        }>
      >("/campaigns"),
      adOpsApi<
        Array<{
          id: string;
          entityType: string;
          action: string;
          createdAt: string;
          actor: { email: string } | null;
        }>
      >("/audit?limit=12"),
    ]);

    const campaignsInQa = campaigns.filter((c) => c.state === "QA").length;
    const pendingQaGates = campaigns.filter(
      (c) => !c.audienceQaAt || !c.budgetQaAt || !c.creativeQaAt,
    ).length;
    const pendingAudienceQa = campaigns.filter((c) => !c.audienceQaAt).length;
    const pendingBudgetQa = campaigns.filter((c) => !c.budgetQaAt).length;
    const pendingCreativeQa = campaigns.filter((c) => !c.creativeQaAt).length;

    return {
      campaignsTotal: campaigns.length,
      campaignsInQa,
      pendingQaGates,
      pendingAudienceQa,
      pendingBudgetQa,
      pendingCreativeQa,
      recentAudit: auditLogs.map((l) => ({
        id: l.id,
        entityType: l.entityType,
        action: l.action,
        createdAt: l.createdAt,
        actorEmail: l.actor?.email ?? null,
      })),
    };
  } catch {
    return null;
  }
}

function fmtAsOf(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Five-question compliance briefing. */
export function buildComplianceOpsCards(
  snapshot: ComplianceOpsSnapshot,
  orgSlug: string,
): ComplianceOpsCard[] {
  const base = `/${orgSlug}`;
  const attention: string[] = [];
  if (snapshot.pendingImportBatches > 0) {
    attention.push(`${snapshot.pendingImportBatches} member import${snapshot.pendingImportBatches === 1 ? "" : "s"} awaiting approval`);
  }
  if (snapshot.openExceptions > 0) {
    attention.push(`${snapshot.openExceptions} automation exception${snapshot.openExceptions === 1 ? "" : "s"}`);
  }
  if (snapshot.adOps?.pendingCreativeQa) {
    attention.push(`${snapshot.adOps.pendingCreativeQa} ad campaign${snapshot.adOps.pendingCreativeQa === 1 ? "" : "s"} missing Creative/MLR QA`);
  }

  const blocked: string[] = [];
  if (snapshot.pendingImportBatches > 0) blocked.push("Roster changes blocked until import approval");
  if (snapshot.adOps?.campaignsInQa) {
    blocked.push(`${snapshot.adOps.campaignsInQa} ad campaign${snapshot.adOps.campaignsInQa === 1 ? "" : "s"} in QA — cannot traffic`);
  }

  return [
    {
      id: "happening",
      question: "What is happening?",
      answer: `${snapshot.auditEntriesLast7Days} staff actions logged this week · audit trail active · alpha compliance presentation (not certified)`,
      tone: "neutral",
    },
    {
      id: "attention",
      question: "What needs attention?",
      answer:
        attention.length > 0
          ? attention.join(" · ")
          : "No elevated approval queues — imports and exceptions within normal thresholds",
      href: attention.length > 0 ? `${base}/compliance` : `${base}/audit`,
      tone: attention.length > 0 ? "attention" : "clear",
    },
    {
      id: "blocked",
      question: "What is blocked?",
      answer:
        blocked.length > 0 ? blocked.join(" · ") : "No approval or QA blocks preventing operations",
      href: blocked.length > 0 ? `${base}/members/imports` : undefined,
      tone: blocked.length > 0 ? "attention" : "clear",
    },
    {
      id: "changed",
      question: "What changed?",
      answer: `Latest audit entry ${snapshot.recentAudit[0] ? fmtAsOf(snapshot.recentAudit[0].createdAt) : "—"} · data as of ${fmtAsOf(snapshot.dataAsOf)}`,
      tone: "neutral",
    },
    {
      id: "next",
      question: "What should happen next?",
      answer:
        snapshot.adOps?.pendingCreativeQa
          ? "Complete Creative/MLR QA on ad campaigns before trafficking"
          : snapshot.pendingImportBatches > 0
            ? "Review staged member imports — approve or reject before apply"
            : "Export audit log for compliance review · confirm advocacy campaign audit trail",
      href: snapshot.adOps?.pendingCreativeQa
        ? `${base}/advertising/campaigns`
        : snapshot.pendingImportBatches > 0
          ? `${base}/members/imports`
          : `${base}/audit`,
      tone: "neutral",
    },
  ];
}

export function buildComplianceApprovalQueue(
  snapshot: ComplianceOpsSnapshot,
  orgSlug: string,
): ComplianceApprovalItem[] {
  const base = `/${orgSlug}`;

  return [
    {
      id: "imports",
      title: "Member imports",
      detail:
        snapshot.pendingImportBatches > 0
          ? `${snapshot.pendingImportBatches} batch${snapshot.pendingImportBatches === 1 ? "" : "es"} staged for staff review`
          : "No pending CSV imports",
      href: `${base}/members/imports`,
      status: snapshot.pendingImportBatches > 0 ? "action" : "clear",
      count: snapshot.pendingImportBatches,
    },
    {
      id: "exceptions",
      title: "Automation exceptions",
      detail:
        snapshot.openExceptions > 0
          ? `${snapshot.openExceptions} workflow step${snapshot.openExceptions === 1 ? "" : "s"} need resolution`
          : "Exception queue clear",
      href: `${base}/exceptions`,
      status: snapshot.openExceptions > 0 ? "action" : "clear",
      count: snapshot.openExceptions,
    },
    {
      id: "mlr",
      title: "Creative / MLR QA",
      detail: snapshot.adOps
        ? snapshot.adOps.pendingCreativeQa > 0
          ? `${snapshot.adOps.pendingCreativeQa} campaign${snapshot.adOps.pendingCreativeQa === 1 ? "" : "s"} missing MLR gate · ${snapshot.adOps.campaignsInQa} in QA state`
          : "All ad campaigns passed Creative/MLR QA gates"
        : "Ad-ops API offline — connect to review MLR queue",
      href: `${base}/advertising/campaigns`,
      status: snapshot.adOps
        ? snapshot.adOps.pendingCreativeQa > 0 || snapshot.adOps.campaignsInQa > 0
          ? "watch"
          : "clear"
        : "watch",
      count: snapshot.adOps?.pendingCreativeQa,
    },
    {
      id: "audit",
      title: "Audit trail",
      detail: `${snapshot.auditEntriesLast7Days} entries this week · immutable staff action log`,
      href: `${base}/audit`,
      status: "clear",
    },
  ];
}

export function formatAuditAction(action: string): string {
  return action.replace(/\./g, " · ").replace(/_/g, " ");
}
