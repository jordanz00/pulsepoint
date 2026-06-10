import { getOrgDb } from "@/lib/db";
import type { CeoCommandCenterData } from "@/lib/ceo-command-center-data";

export type CommandCenterOpsSnapshot = {
  exceptionCount: number;
  pendingImportBatches: number;
  highPriorityReviewCount: number;
  committeeAlertCount: number;
  atRiskMemberCount: number;
  dataAsOf: Date;
};

export type CommandCenterOpsCard = {
  id: string;
  question: string;
  answer: string;
  href?: string;
  tone?: "neutral" | "attention" | "clear";
};

/** Live operator counts — org DB only. */
export async function loadCommandCenterOpsSnapshot(
  orgId: string,
  data: CeoCommandCenterData,
): Promise<CommandCenterOpsSnapshot> {
  const db = getOrgDb(orgId);
  const [exceptionCount, pendingImportBatches] = await Promise.all([
    db.automationException.count({ where: { orgId, resolvedAt: null } }),
    db.memberImportBatch.count({ where: { orgId, status: "PENDING_REVIEW" } }),
  ]);

  const highPriorityReviewCount = data.executiveReview.filter(
    (r) => r.priority === "high" || r.priority === "medium",
  ).length;

  return {
    exceptionCount,
    pendingImportBatches,
    highPriorityReviewCount,
    committeeAlertCount: data.committees.alerts.length,
    atRiskMemberCount: data.revenue.atRiskMemberCount,
    dataAsOf: data.dataAsOf,
  };
}

function fmtAsOf(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Five-question executive briefing from live org + Quake-adjacent ops data. */
export function buildCommandCenterOpsCards(
  data: CeoCommandCenterData,
  ops: CommandCenterOpsSnapshot,
  orgSlug: string,
): CommandCenterOpsCard[] {
  const base = `/${orgSlug}`;
  const attentionParts: string[] = [];
  if (ops.exceptionCount > 0) attentionParts.push(`${ops.exceptionCount} exception${ops.exceptionCount === 1 ? "" : "s"}`);
  if (ops.pendingImportBatches > 0) {
    attentionParts.push(`${ops.pendingImportBatches} import batch${ops.pendingImportBatches === 1 ? "" : "es"} awaiting review`);
  }
  if (ops.highPriorityReviewCount > 0) {
    attentionParts.push(`${ops.highPriorityReviewCount} intelligence insight${ops.highPriorityReviewCount === 1 ? "" : "s"}`);
  }
  if (ops.committeeAlertCount > 0) {
    attentionParts.push(`${ops.committeeAlertCount} committee roster alert${ops.committeeAlertCount === 1 ? "" : "s"}`);
  }

  const blockedParts: string[] = [];
  if (ops.pendingImportBatches > 0) blockedParts.push("Member imports pending staff approval");
  if (ops.exceptionCount > 0) blockedParts.push("Unresolved automation exceptions");

  return [
    {
      id: "happening",
      question: "What is happening?",
      answer: `${data.members.total} active members · ${data.events.upcoming} upcoming events · ${data.advocacy.activeCount} active advocacy issues · revenue MTD from live ledger`,
      tone: "neutral",
    },
    {
      id: "attention",
      question: "What needs attention?",
      answer:
        attentionParts.length > 0
          ? attentionParts.join(" · ")
          : "No elevated queues — membership and revenue within normal demo thresholds",
      href: attentionParts.length > 0 ? `${base}/exceptions` : `${base}/intelligence`,
      tone: attentionParts.length > 0 ? "attention" : "clear",
    },
    {
      id: "blocked",
      question: "What is blocked?",
      answer:
        blockedParts.length > 0
          ? blockedParts.join(" · ")
          : "No import or automation blocks — operators can proceed",
      href: blockedParts.length > 0 ? `${base}/members/imports` : undefined,
      tone: blockedParts.length > 0 ? "attention" : "clear",
    },
    {
      id: "changed",
      question: "What changed?",
      answer: `${data.members.joinedThisMonth} members joined this month (${data.members.growthDelta >= 0 ? "+" : ""}${data.members.growthDelta} vs prior month) · data as of ${fmtAsOf(ops.dataAsOf)}`,
      tone: "neutral",
    },
    {
      id: "next",
      question: "What should happen next?",
      answer:
        ops.atRiskMemberCount > 0
          ? `Review ${ops.atRiskMemberCount} at-risk or renewal members · export renewals for finance`
          : ops.highPriorityReviewCount > 0
            ? "Work the intelligence review queue · confirm advocacy campaign responses"
            : "Run leadership loop · export board pack before next executive session",
      href:
        ops.atRiskMemberCount > 0
          ? `${base}/members/renewals`
          : ops.highPriorityReviewCount > 0
            ? `${base}/intelligence`
            : `${base}/leadership`,
      tone: "neutral",
    },
  ];
}

export type CommandCenterOperatorPanel = {
  id: string;
  title: string;
  value: string;
  detail: string;
  href: string;
  status: "clear" | "watch" | "action";
};

export function buildCommandCenterOperatorPanels(
  ops: CommandCenterOpsSnapshot,
  orgSlug: string,
): CommandCenterOperatorPanel[] {
  const base = `/${orgSlug}`;

  const alertTotal =
    ops.exceptionCount + ops.committeeAlertCount + (ops.atRiskMemberCount > 0 ? 1 : 0);

  return [
    {
      id: "alerts",
      title: "Alerts",
      value: String(alertTotal),
      detail:
        alertTotal > 0
          ? `${ops.exceptionCount} exceptions · ${ops.committeeAlertCount} committee · ${ops.atRiskMemberCount} revenue-at-risk members`
          : "No open alert classes in this org",
      href: `${base}/exceptions`,
      status: alertTotal > 0 ? "action" : "clear",
    },
    {
      id: "approvals",
      title: "Approvals",
      value: String(ops.pendingImportBatches + ops.highPriorityReviewCount),
      detail:
        ops.pendingImportBatches + ops.highPriorityReviewCount > 0
          ? `${ops.pendingImportBatches} imports · ${ops.highPriorityReviewCount} intelligence reviews`
          : "No pending imports or flagged reviews",
      href: `${base}/members/imports`,
      status:
        ops.pendingImportBatches > 0 || ops.highPriorityReviewCount > 0 ? "watch" : "clear",
    },
    {
      id: "sync",
      title: "Sync health",
      value: ops.exceptionCount > 0 ? "Review" : "Healthy",
      detail:
        ops.exceptionCount > 0
          ? `${ops.exceptionCount} automation exception${ops.exceptionCount === 1 ? "" : "s"} — resolve before nightly jobs`
          : "Imports staged · exceptions queue empty · audit trail active",
      href: `${base}/audit`,
      status: ops.exceptionCount > 0 ? "action" : "clear",
    },
  ];
}
