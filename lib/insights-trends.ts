/**
 * Insights trend history — reads InsightsSnapshot for period-over-period deltas.
 */

import { getOrgDb } from "@/lib/db";

export type TrendPoint = {
  takenAt: Date;
  value: number;
};

export type MetricTrend = {
  metricKey: string;
  label: string;
  unit: string;
  points: TrendPoint[];
  latest: number | null;
  previous: number | null;
  deltaPct: number | null;
};

const METRIC_LABELS: Record<string, string> = {
  "revenue.total": "Total revenue",
  "revenue.dues": "Dues revenue",
  "revenue.non_dues": "Non-dues revenue",
  "members.active": "Active members",
  "members.at_risk": "At-risk members",
  "members.lapsed": "Lapsed members",
  "members.renewal_due_30": "Renewals due (30 days)",
  "members.hospital_accounts": "Hospital accounts",
  "membership.retention_pct": "Retention rate (%)",
  "membership.renewal_overdue": "Renewal overdue",
  "events.registrations": "Event registrations",
  "events.published": "Published events",
};

const TRACKED_KEYS = [
  "revenue.total",
  "revenue.dues",
  "members.active",
  "members.at_risk",
  "events.registrations",
] as const;

export async function loadInsightsTrends(orgId: string, limitPerKey = 12): Promise<MetricTrend[]> {
  const db = getOrgDb(orgId);
  const trends: MetricTrend[] = [];

  for (const metricKey of TRACKED_KEYS) {
    const rows = await db.insightsSnapshot.findMany({
      where: { orgId, metricKey },
      orderBy: { takenAt: "desc" },
      take: limitPerKey,
    });
    if (rows.length === 0) continue;

    const points = [...rows]
      .reverse()
      .map((r) => ({ takenAt: r.takenAt, value: r.value }));
    const latest = points[points.length - 1]?.value ?? null;
    const previous = points.length >= 2 ? points[points.length - 2].value : null;
    let deltaPct: number | null = null;
    if (latest != null && previous != null && previous !== 0) {
      deltaPct = Math.round(((latest - previous) / Math.abs(previous)) * 1000) / 10;
    }

    trends.push({
      metricKey,
      label: METRIC_LABELS[metricKey] ?? metricKey,
      unit: rows[0]?.unit ?? "",
      points,
      latest,
      previous,
      deltaPct,
    });
  }

  return trends;
}
