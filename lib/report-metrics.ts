/**
 * Resolve report / snapshot metric keys from live org data.
 */

import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { loadMembershipAnalytics } from "@/lib/membership-analytics";
import { REPORT_METRIC_CATALOG } from "@/lib/report-metric-catalog";

export type ResolvedMetric = {
  metricKey: string;
  label: string;
  value: number;
  unit: string;
  display: string;
};

export { REPORT_METRIC_CATALOG };

function formatDisplay(value: number, unit: string): string {
  if (unit === "usd") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === "pct") return `${value}%`;
  return new Intl.NumberFormat("en-US").format(value);
}

export async function resolveReportMetrics(
  orgId: string,
  metricKeys: string[],
): Promise<ResolvedMetric[]> {
  const [executive, membership] = await Promise.all([
    loadExecutiveDashboard(orgId),
    loadMembershipAnalytics(orgId),
  ]);

  const kpiMap = Object.fromEntries(executive.kpis.map((k) => [k.id, k]));
  const extra: Record<string, ResolvedMetric> = {
    "membership.retention_pct": {
      metricKey: "membership.retention_pct",
      label: "Retention rate (%)",
      value: membership.retentionRatePct ?? 0,
      unit: "pct",
      display: formatDisplay(membership.retentionRatePct ?? 0, "pct"),
    },
    "membership.renewal_overdue": {
      metricKey: "membership.renewal_overdue",
      label: "Renewal overdue",
      value: membership.totals.renewalOverdue,
      unit: "count",
      display: formatDisplay(membership.totals.renewalOverdue, "count"),
    },
  };

  const resolved: ResolvedMetric[] = [];
  for (const key of metricKeys) {
    if (extra[key]) {
      resolved.push(extra[key]);
      continue;
    }
    const kpi = kpiMap[key];
    if (!kpi) continue;
    resolved.push({
      metricKey: kpi.id,
      label: kpi.label,
      value: kpi.value,
      unit: kpi.unit,
      display: formatDisplay(kpi.value, kpi.unit),
    });
  }
  return resolved;
}

/** Map resolved metrics to key→value for snapshot parity checks. */
export function metricsToValueMap(metrics: ResolvedMetric[]): Map<string, number> {
  return new Map(metrics.map((m) => [m.metricKey, m.value]));
}

/** True when every snapshot row matches the live resolved value for the same key. */
export function snapshotsMatchResolved(
  resolved: ResolvedMetric[],
  snapshots: Array<{ metricKey: string; value: number }>,
): boolean {
  const live = metricsToValueMap(resolved);
  if (snapshots.length !== resolved.length) return false;
  return snapshots.every((s) => live.get(s.metricKey) === s.value);
}

/** Catalog keys that must resolve via executive KPIs or membership extras. */
export function catalogResolvableKeys(): string[] {
  return REPORT_METRIC_CATALOG.map((m) => m.id);
}

export async function persistMetricSnapshots(
  orgId: string,
  metrics: ResolvedMetric[],
  takenAt = new Date(),
) {
  const { getOrgDb } = await import("@/lib/db");
  const db = getOrgDb(orgId);
  for (const m of metrics) {
    await db.insightsSnapshot.create({
      data: {
        orgId,
        metricKey: m.metricKey,
        value: m.value,
        unit: m.unit,
        takenAt,
      },
    });
  }
  return metrics.length;
}
