/**
 * Template-first executive briefing from live ExecutiveDashboard data — no invented stats.
 */

import type { ExecutiveDashboard } from "@/lib/executive-metrics";
import type { ActivityKind } from "@/lib/dashboard-glass";
import type { DashboardTopic } from "@/lib/dashboard-topic-colors";
import { kpiTopic } from "@/lib/dashboard-topic-colors";
import { sanitizeText } from "@/lib/security/sanitize-text";

export type BriefSnapshotStat = {
  id: string;
  label: string;
  value: string;
  topic: DashboardTopic;
  whyItMatters: string;
};

export type BriefAttentionItem = {
  count: number;
  headline: string;
  detail: string;
  topic: DashboardTopic;
};

export type BriefActivityItem = {
  id: string;
  summary: string;
  when: Date;
  kind: ActivityKind;
};

export type ExecutiveBrief = {
  dataAsOf: string;
  headline: string;
  snapshotStats: BriefSnapshotStat[];
  atAGlance: string[];
  whatChanged: string[];
  activityItems: BriefActivityItem[];
  needsAttention: string[];
  attentionItems: BriefAttentionItem[];
  /** @deprecated UI uses snapshotStats — kept for API compatibility */
  kpiMeanings: Array<{
    label: string;
    value: string;
    whyItMatters: string;
    topic: DashboardTopic;
  }>;
};

function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function kpiById(dashboard: ExecutiveDashboard, id: string) {
  return dashboard.kpis.find((k) => k.id === id);
}

const WHY_PRIMARY: Record<string, string> = {
  "revenue.total": "Programs, staff, and advocacy funding on record.",
  "revenue.dues": "Core membership income for the annual budget.",
  "revenue.non_dues": "Events and fundraising beyond dues.",
  "members.active": "Members you serve and represent today.",
};

/** Demo enter/exit noise is not executive signal. */
function isBriefworthyAudit(action: string, summary?: string): boolean {
  const a = action.toLowerCase();
  const s = (summary ?? "").toLowerCase();
  if (a.startsWith("demo.")) return false;
  if (s.includes("demo entered") || s.includes("demo exited")) return false;
  if (s.includes("demosession")) return false;
  return true;
}

/**
 * Build layman-readable briefing from DB-sourced dashboard only.
 */
export function buildExecutiveBrief(dashboard: ExecutiveDashboard): ExecutiveBrief {
  const total = kpiById(dashboard, "revenue.total");
  const dues = kpiById(dashboard, "revenue.dues");
  const nonDues = kpiById(dashboard, "revenue.non_dues");
  const active = kpiById(dashboard, "members.active");
  const atRisk = kpiById(dashboard, "members.at_risk");
  const lapsed = kpiById(dashboard, "members.lapsed");
  const renewals = kpiById(dashboard, "members.renewal_due_30");

  const nonDuesPct =
    total && nonDues && total.value > 0
      ? Math.round((nonDues.value / total.value) * 100)
      : null;

  const snapshotStats: BriefSnapshotStat[] = [];
  if (total) {
    snapshotStats.push({
      id: total.id,
      label: "Total revenue",
      value: fmtUsd(total.value),
      topic: kpiTopic(total.id),
      whyItMatters: WHY_PRIMARY[total.id] ?? "",
    });
  }
  if (active) {
    snapshotStats.push({
      id: active.id,
      label: "Active members",
      value: active.value.toLocaleString(),
      topic: kpiTopic(active.id),
      whyItMatters: WHY_PRIMARY[active.id] ?? "",
    });
  }
  if (nonDuesPct != null) {
    snapshotStats.push({
      id: "revenue.non_dues_share",
      label: "Non-dues share",
      value: `${nonDuesPct}%`,
      topic: "finance",
      whyItMatters: WHY_PRIMARY["revenue.non_dues"] ?? "",
    });
  } else if (dues) {
    snapshotStats.push({
      id: dues.id,
      label: "Dues revenue",
      value: fmtUsd(dues.value),
      topic: kpiTopic(dues.id),
      whyItMatters: WHY_PRIMARY[dues.id] ?? "",
    });
  }

  const headlineParts: string[] = [];
  if (total) headlineParts.push(`${fmtUsd(total.value)} recorded revenue`);
  if (active) headlineParts.push(`${active.value.toLocaleString()} active members`);
  const headline =
    headlineParts.length > 0
      ? `${headlineParts.join(" · ")} — live from your association data.`
      : "Live snapshot from your association data.";

  const atAGlance: string[] = [];
  if (nonDuesPct != null && nonDuesPct >= 50) {
    atAGlance.push(
      `${nonDuesPct}% of revenue is from events, commerce, and fundraising — diversified beyond dues.`,
    );
  } else if (total) {
    atAGlance.push(
      `${fmtUsd(total.value)} in recorded revenue across dues, events, and giving.`,
    );
  }
  if (active) {
    atAGlance.push(`${active.value.toLocaleString()} members are active in the directory.`);
  }
  if (atRisk && atRisk.value > 0) {
    atAGlance.push(
      `${atRisk.value} member${atRisk.value === 1 ? "" : "s"} flagged at-risk — review the outreach queue.`,
    );
  }

  const activityItems: BriefActivityItem[] = dashboard.auditTrail
    .filter((a) => isBriefworthyAudit(a.action, a.summary))
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      summary: sanitizeText(a.summary, { maxLength: 200 }),
      when: a.when,
      kind: a.kind,
    }));

  const whatChanged =
    activityItems.length > 0
      ? activityItems.map((a) => {
          const when = a.when.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
          return `${when}: ${a.summary}`;
        })
      : dashboard.auditTrail.length > 0
        ? ["Recent log entries were demo navigation only — staff exports and publishes will appear here."]
        : [];

  const attentionItems: BriefAttentionItem[] = [];
  if (atRisk && atRisk.value > 0) {
    attentionItems.push({
      count: atRisk.value,
      headline: "At-risk members",
      detail: "Personal outreach while engagement is slipping.",
      topic: "attention",
    });
  }
  if (lapsed && lapsed.value > 0) {
    attentionItems.push({
      count: lapsed.value,
      headline: "Lapsed members",
      detail: "Win-back or renewal campaign candidates.",
      topic: "attention",
    });
  }
  if (renewals && renewals.value > 0) {
    attentionItems.push({
      count: renewals.value,
      headline: "Renewals due",
      detail: "Due within the next 30 days.",
      topic: "members",
    });
  }

  const needsAttention: string[] = attentionItems.map(
    (item) => `${item.count} ${item.headline.toLowerCase()} — ${item.detail}`,
  );
  if (needsAttention.length === 0) {
    needsAttention.push("No urgent member or revenue exceptions in the latest data.");
  }

  const kpiMeanings = dashboard.kpis
    .filter((k) => k.emphasis === "primary")
    .slice(0, 4)
    .map((k) => ({
      label: k.label,
      value: k.unit === "usd" ? fmtUsd(k.value) : k.value.toLocaleString(),
      whyItMatters: WHY_PRIMARY[k.id] ?? "Tracks operational health at a glance.",
      topic: k.id.startsWith("revenue") ? ("finance" as const) : ("members" as const),
    }));

  return {
    dataAsOf: dashboard.dataAsOf.toISOString(),
    headline,
    snapshotStats,
    atAGlance: atAGlance.slice(0, 3),
    whatChanged,
    activityItems,
    needsAttention,
    attentionItems,
    kpiMeanings,
  };
}
