"use server";

/**
 * PulsePoint Insights — revenue-first executive dashboard (alpha).
 * Numbers come from Commerce, Giving, Events, and Members — not hand-entered KPIs.
 */

import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { loadExecutiveDashboard, type ExecutiveDashboard } from "@/lib/executive-metrics";
import {
  persistMetricSnapshots,
  REPORT_METRIC_CATALOG,
  resolveReportMetrics,
} from "@/lib/report-metrics";

type InsightsKpi = {
  metricKey: string;
  label: string;
  value: number;
  unit: string;
};

export async function getExecutiveDashboard(orgSlug: string): Promise<ExecutiveDashboard> {
  const staff = await requireCapability("member:read", { orgSlug });
  return loadExecutiveDashboard(staff.orgId);
}

/** @deprecated Prefer getExecutiveDashboard — kept for snapshots. */
export async function getInsightsKpis(orgSlug: string): Promise<InsightsKpi[]> {
  const dash = await getExecutiveDashboard(orgSlug);
  return dash.kpis.map((k) => ({
    metricKey: k.id,
    label: k.label,
    value: k.value,
    unit: k.unit,
  }));
}

export async function snapshotKpis(orgSlug: string) {
  const staff = await requireCapability("org:settings", { orgSlug });
  const keys = REPORT_METRIC_CATALOG.map((m) => m.id);
  const metrics = await resolveReportMetrics(staff.orgId, [...keys]);
  const snapshots = await persistMetricSnapshots(staff.orgId, metrics);
  return { ok: true as const, snapshots };
}
