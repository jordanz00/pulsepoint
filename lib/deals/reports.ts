/**
 * Deal report computations — Nimble-style analytics from pipeline data.
 */

import type { Deal, DealStage } from "@/app/generated/prisma/client";
import { ACTIVE_DEAL_STAGES, DEAL_STAGE_LABEL } from "@/lib/deals/constants";
import { filterDeals, type DealReportFilters } from "@/lib/deals/report-filters";

export type ReportSegment = { label: string; value: number; meta?: string };
export type ReportSeries = { label: string; points: ReportSegment[] };

export type DealReportResult =
  | { kind: "segments"; segments: ReportSegment[] }
  | { kind: "series"; series: ReportSeries[] }
  | { kind: "table"; columns: string[]; rows: string[][] };

function usd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export function computeLostByStage(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const rows = filterDeals(deals, filters).filter((d) => d.stage === "LOST");
  const counts = new Map<string, number>();
  for (const d of rows) {
    const stage = d.lostAtStage ?? "NEGOTIATION";
    counts.set(stage, (counts.get(stage) ?? 0) + 1);
  }
  const segments = ACTIVE_DEAL_STAGES.map((s) => ({
    label: DEAL_STAGE_LABEL[s] ?? s,
    value: counts.get(s) ?? 0,
  })).filter((s) => s.value > 0);
  return { kind: "segments", segments };
}

export function computeWonOverTime(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const won = filterDeals(deals, filters).filter((d) => d.stage === "WON" && d.closedAt);
  const byMonth = new Map<string, number>();
  for (const d of won) {
    const dt = d.closedAt!;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + d.amountCents);
  }
  const points = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
  return { kind: "series", series: [{ label: "Revenue won", points }] };
}

export function computeLostByReason(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const lost = filterDeals(deals, filters).filter((d) => d.stage === "LOST");
  const counts = new Map<string, number>();
  for (const d of lost) {
    const label = d.lossReasonId ? `reason:${d.lossReasonId}` : "Unspecified";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return {
    kind: "table",
    columns: ["Reason", "Count"],
    rows: [...counts.entries()].map(([k, v]) => [k.startsWith("reason:") ? k : "Unspecified", String(v)]),
  };
}

export function computeRevenueForecast(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const open = filterDeals(deals, filters).filter((d) =>
    ACTIVE_DEAL_STAGES.includes(d.stage as (typeof ACTIVE_DEAL_STAGES)[number]),
  );
  const byStage = new Map<string, number>();
  for (const d of open) {
    byStage.set(d.stage, (byStage.get(d.stage) ?? 0) + d.amountCents);
  }
  const segments = ACTIVE_DEAL_STAGES.map((s) => ({
    label: DEAL_STAGE_LABEL[s] ?? s,
    value: byStage.get(s) ?? 0,
    meta: usd(byStage.get(s) ?? 0),
  }));
  return { kind: "segments", segments };
}

export function computeDealConversion(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const filtered = filterDeals(deals, filters);
  const stages: DealStage[] = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"];
  const rows: string[][] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    const from = stages[i]!;
    const to = stages[i + 1]!;
    const reachedFrom = filtered.filter((d) => stageIndex(d.stage) >= stageIndex(from)).length;
    const reachedTo = filtered.filter((d) => stageIndex(d.stage) >= stageIndex(to)).length;
    const rate = reachedFrom > 0 ? Math.round((reachedTo / reachedFrom) * 100) : 0;
    rows.push([
      `${DEAL_STAGE_LABEL[from]} → ${DEAL_STAGE_LABEL[to]}`,
      String(reachedFrom),
      String(reachedTo),
      `${rate}%`,
    ]);
  }
  return {
    kind: "table",
    columns: ["Stage transition", "Entered from", "Reached to", "Conversion"],
    rows,
  };
}

function stageIndex(s: DealStage): number {
  const order: DealStage[] = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
  return order.indexOf(s);
}

export function computeDealProgress(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const filtered = filterDeals(deals, filters);
  const segments = [...ACTIVE_DEAL_STAGES, "WON" as DealStage, "LOST" as DealStage].map((stage) => ({
    label: DEAL_STAGE_LABEL[stage] ?? stage,
    value: filtered.filter((d) => d.stage === stage).length,
  }));
  return { kind: "segments", segments };
}

export function computeTeamLeaderboard(deals: Deal[], filters: DealReportFilters): DealReportResult {
  const filtered = filterDeals(deals, filters);
  const byPerson = new Map<string, { won: number; lost: number; open: number; revenue: number }>();
  for (const d of filtered) {
    const key = d.assigneeName || "Unassigned";
    const row = byPerson.get(key) ?? { won: 0, lost: 0, open: 0, revenue: 0 };
    if (d.stage === "WON") {
      row.won += 1;
      row.revenue += d.amountCents;
    } else if (d.stage === "LOST") row.lost += 1;
    else row.open += 1;
    byPerson.set(key, row);
  }
  return {
    kind: "table",
    columns: ["Rep", "Won", "Lost", "Open", "Won revenue"],
    rows: [...byPerson.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([name, r]) => [name, String(r.won), String(r.lost), String(r.open), usd(r.revenue)]),
  };
}

export function computeReport(
  reportType: string,
  deals: Deal[],
  filters: DealReportFilters,
  reasonLabels?: Map<string, string>,
): DealReportResult {
  let result: DealReportResult;
  switch (reportType) {
    case "LOST_BY_STAGE":
      result = computeLostByStage(deals, filters);
      break;
    case "WON_OVER_TIME":
      result = computeWonOverTime(deals, filters);
      break;
    case "LOST_BY_REASON":
      result = computeLostByReason(deals, filters);
      if (result.kind === "table" && reasonLabels) {
        result.rows = result.rows.map(([k, v]) => [
          k.startsWith("reason:") ? reasonLabels.get(k.replace("reason:", "")) ?? k : k,
          v,
        ]);
      }
      break;
    case "REVENUE_FORECAST":
      result = computeRevenueForecast(deals, filters);
      break;
    case "DEAL_CONVERSION":
      result = computeDealConversion(deals, filters);
      break;
    case "DEAL_PROGRESS":
      result = computeDealProgress(deals, filters);
      break;
    case "TEAM_LEADERBOARD":
      result = computeTeamLeaderboard(deals, filters);
      break;
    default:
      result = { kind: "segments", segments: [] };
  }
  return result;
}
