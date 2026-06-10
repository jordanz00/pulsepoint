/**
 * Board pack HTML — printable executive report from live dashboard data.
 */

import type { ExecutiveDashboard } from "@/lib/executive-metrics";
import type { ExecutiveBrief } from "@/lib/copilot/executive-brief";
import type { PeriodDelta } from "@/lib/dashboard-glass";
import { renderBoardPackLeadershipLoopSection } from "@/lib/board-pack/leadership-loop-section";

export type BoardPackChartInput = {
  revenueTrend: { label: string; value: number }[];
  duesPct: number;
  nonDuesPct: number;
};

export type BoardPackDeltas = Record<string, PeriodDelta | null | undefined>;

function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtUsdFromCents(cents: number): string {
  return fmtUsd(cents / 100);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deltaArrow(direction: PeriodDelta["direction"]): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

function renderTrendBars(points: { label: string; value: number }[]): string {
  if (points.length === 0) return "<p class=\"muted\">No revenue trend in latest data.</p>";
  const max = Math.max(...points.map((p) => p.value), 1);
  return `<div class="trend-bars">${points
    .map(
      (p) => `
      <div class="trend-bar-col" title="${escapeHtml(p.label)}: ${escapeHtml(String(p.value))}">
        <div class="trend-bar-fill" style="height:${Math.max(8, Math.round((p.value / max) * 100))}%"></div>
        <span class="trend-bar-label">${escapeHtml(p.label)}</span>
      </div>`,
    )
    .join("")}</div>`;
}

export function buildBoardPackHtml(input: {
  orgName: string;
  orgSlug: string;
  dashboard: ExecutiveDashboard;
  brief: ExecutiveBrief;
  charts: BoardPackChartInput;
  deltas?: BoardPackDeltas;
  generatedAt: Date;
}): string {
  const { orgName, orgSlug, dashboard, brief, charts, deltas = {}, generatedAt } = input;
  const asOf = generatedAt.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const primaryKpis = dashboard.kpis
    .filter((k) => k.emphasis === "primary")
    .slice(0, 6)
    .map((k) => {
      const delta = deltas[k.id];
      const deltaHtml = delta
        ? `<div class="kpi-delta kpi-delta--${delta.direction}">${deltaArrow(delta.direction)} ${escapeHtml(delta.label)}</div>`
        : "";
      const display =
        k.unit === "usd" ? fmtUsd(k.value) : k.value.toLocaleString();
      return `
      <div class="kpi">
        <div class="kpi-label">${escapeHtml(k.label)}</div>
        <div class="kpi-value">${escapeHtml(display)}</div>
        ${deltaHtml}
      </div>`;
    })
    .join("");

  const attention = brief.attentionItems
    .map(
      (a) =>
        `<li><strong>${a.count.toLocaleString()}</strong> ${escapeHtml(a.headline)} — ${escapeHtml(a.detail)}</li>`,
    )
    .join("");

  const glance = brief.atAGlance.map((line) => `<li>${escapeHtml(line)}</li>`).join("");

  const revenueLines = dashboard.revenueLines
    .slice(0, 6)
    .map((line) => {
      const pct =
        dashboard.totalRevenueCents > 0
          ? Math.round((line.amountCents / dashboard.totalRevenueCents) * 100)
          : 0;
      return `<tr><td>${escapeHtml(line.label)}</td><td class="num">${escapeHtml(fmtUsdFromCents(line.amountCents))}</td><td class="num">${pct}%</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(orgName)} — Board briefing</title>
  <style>
    :root { --navy: #0b2840; --muted: #5a7a94; --accent: #0072bc; --green: #0f6e56; --orange: #c45c00; --bg: #f4f6fb; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; background: var(--bg); color: var(--navy); line-height: 1.5; }
    .wrap { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem 3rem; }
    .eyebrow { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin: 0 0 0.35rem; }
    h1 { font-size: 1.75rem; font-weight: 650; letter-spacing: -0.03em; margin: 0 0 0.25rem; }
    .lead { font-size: 1rem; color: var(--muted); margin: 0 0 1.5rem; max-width: 40rem; }
    .meta { font-size: 0.8rem; color: var(--muted); margin-bottom: 2rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 2rem; }
    .kpi { background: #fff; border: 1px solid rgba(11,40,64,0.08); border-radius: 12px; padding: 1rem; }
    .kpi-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
    .kpi-value { font-size: 1.35rem; font-weight: 700; margin-top: 0.25rem; font-variant-numeric: tabular-nums; }
    .kpi-delta { font-size: 0.72rem; margin-top: 0.35rem; font-weight: 600; }
    .kpi-delta--up { color: var(--green); }
    .kpi-delta--down { color: var(--orange); }
    .kpi-delta--flat { color: var(--muted); }
    section { background: #fff; border: 1px solid rgba(11,40,64,0.08); border-radius: 16px; padding: 1.25rem 1.35rem; margin-bottom: 1rem; }
    h2 { font-size: 1rem; font-weight: 650; margin: 0 0 0.65rem; }
    ul { margin: 0; padding-left: 1.15rem; }
    li { margin-bottom: 0.35rem; font-size: 0.9rem; }
    .mix-row { display: flex; gap: 1rem; margin-top: 0.75rem; }
    .mix-chip { flex: 1; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,114,188,0.06); text-align: center; }
    .mix-chip--nd { background: rgba(15,110,86,0.08); }
    .mix-val { font-size: 1.25rem; font-weight: 700; }
    .mix-lbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
    .trend-bars { display: flex; align-items: flex-end; gap: 0.35rem; height: 5.5rem; margin-top: 0.75rem; }
    .trend-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .trend-bar-fill { width: 100%; max-width: 2.5rem; background: linear-gradient(180deg, var(--accent), #4da3d9); border-radius: 4px 4px 0 0; min-height: 4px; }
    .trend-bar-label { font-size: 0.6rem; color: var(--muted); margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 0.5rem; }
    th, td { text-align: left; padding: 0.45rem 0.35rem; border-bottom: 1px solid rgba(11,40,64,0.06); }
    th { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    .muted { font-size: 0.85rem; color: var(--muted); }
    .footer { font-size: 0.75rem; color: var(--muted); margin-top: 2rem; border-top: 1px solid rgba(11,40,64,0.1); padding-top: 1rem; }
    @media print { body { background: #fff; } .wrap { padding: 0; } section, .kpi { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">Board briefing · PulsePoint Insights</p>
    <h1>${escapeHtml(orgName)}</h1>
    <p class="lead">${escapeHtml(brief.headline)}</p>
    <p class="meta">Generated ${escapeHtml(asOf)} · Live association data · /${escapeHtml(orgSlug)}/insights/board-pack</p>
    <div class="kpi-grid">${primaryKpis}</div>
    <section>
      <h2>Revenue trend</h2>
      ${renderTrendBars(charts.revenueTrend)}
      <div class="mix-row">
        <div class="mix-chip"><div class="mix-val">${charts.duesPct}%</div><div class="mix-lbl">Dues</div></div>
        <div class="mix-chip mix-chip--nd"><div class="mix-val">${charts.nonDuesPct}%</div><div class="mix-lbl">Non-dues</div></div>
        <div class="mix-chip"><div class="mix-val">${escapeHtml(fmtUsdFromCents(dashboard.totalRevenueCents))}</div><div class="mix-lbl">Total recorded</div></div>
      </div>
    </section>
    ${
      revenueLines
        ? `<section><h2>Revenue by source</h2><table><thead><tr><th>Source</th><th>Amount</th><th>Share</th></tr></thead><tbody>${revenueLines}</tbody></table></section>`
        : ""
    }
    <section>
      <h2>At a glance</h2>
      <ul>${glance || "<li>No summary lines in latest data.</li>"}</ul>
    </section>
    <section>
      <h2>Needs attention</h2>
      <ul>${attention || "<li>All clear in latest data.</li>"}</ul>
    </section>
    <section>
      <h2>Portfolio modules (alpha preview)</h2>
      <ul>
        <li><strong>Advocacy</strong> — Public issue stories and take-action campaigns on the member roster.</li>
        <li><strong>Learn / workforce</strong> — Video playlists and virtual career fair booth grid.</li>
        <li><strong>Member portal</strong> — Self-service CE transcript download from My certifications.</li>
        <li><strong>Insights</strong> — This board pack exports from the same KPI engine as the admin dashboard.</li>
      </ul>
    </section>
    ${renderBoardPackLeadershipLoopSection(orgSlug)}
    <p class="footer">Board pack from PulsePoint AMS — verify figures against staff exports before external distribution. Advocacy and workforce sections are illustrative alpha previews.</p>
  </div>
</body>
</html>`;
}
