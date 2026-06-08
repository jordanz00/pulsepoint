"use client";

import type { ReactNode } from "react";
import type { DealReportResult } from "@/lib/deals/reports";

const DONUT_SEGMENT_COLORS = [
  "var(--accent-brand)",
  "var(--pp-tier-moderate)",
  "var(--pp-tier-active)",
  "var(--pp-tier-atrisk)",
  "var(--accent-warning)",
  "var(--accent-danger)",
] as const;

function maxValue(segments: { value: number }[]) {
  return Math.max(1, ...segments.map((s) => s.value));
}

function ChartShell({ children }: { children: React.ReactNode }) {
  return <div className="pp-deal-report-chart glass pp-glass-surface">{children}</div>;
}

export function DealReportChart({
  chartType,
  result,
}: {
  chartType: string;
  result: DealReportResult;
}) {
  if (result.kind === "table" || chartType === "TABLE") {
    const table = result.kind === "table" ? result : { columns: [] as string[], rows: [] as string[][] };
    return (
      <ChartShell>
      <div className="pc-table-wrap">
        <table className="pc-table text-sm">
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={table.columns.length || 1} className="text-[var(--fg-muted)]">
                  No data for current filters
                </td>
              </tr>
            ) : (
              table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </ChartShell>
    );
  }

  if (result.kind === "series") {
    const points = result.series[0]?.points ?? [];
    const max = maxValue(points);
    return (
      <ChartShell>
      <div className="pp-deal-report-chart__bars space-y-2">
        {points.length === 0 ? (
          <p className="text-sm text-[var(--readable-on-light-muted)]">No data for current filters</p>
        ) : (
          points.map((p) => (
            <div key={p.label}>
              <div className="mb-1 flex justify-between text-xs text-[var(--readable-on-light-muted)]">
                <span>{p.label}</span>
                <span>${(p.value / 100).toLocaleString()}</span>
              </div>
              <div className="pp-deal-report-chart__track h-2 rounded-full">
                <div
                  className="pp-deal-report-chart__fill h-2 rounded-full"
                  style={{ width: `${Math.round((p.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
      </ChartShell>
    );
  }

  const segments = result.segments;
  const max = maxValue(segments);
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (chartType === "DONUT" && total > 0) {
    let offset = 0;
    const stops = segments
      .filter((s) => s.value > 0)
      .map((seg, i) => {
        const pct = (seg.value / total) * 100;
        const start = offset;
        offset += pct;
        return `${DONUT_SEGMENT_COLORS[i % DONUT_SEGMENT_COLORS.length]} ${start}% ${offset}%`;
      })
      .join(", ");

    return (
      <ChartShell>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className="h-28 w-28 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label="Donut chart"
        />
        <ul className="space-y-1 text-sm">
          {segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <li key={s.label} className="flex gap-2 text-[var(--readable-on-light-fg)]">
                <span className="font-medium">{s.label}</span>
                <span className="text-[var(--readable-on-light-muted)]">{s.value}</span>
              </li>
            ))}
        </ul>
      </div>
      </ChartShell>
    );
  }

  return (
    <ChartShell>
    <div className="pp-deal-report-chart__bars space-y-3">
      {segments.every((s) => s.value === 0) ? (
        <p className="text-sm text-[var(--fg-muted)]">No data for current filters</p>
      ) : (
        segments.map((s) => (
          <div key={s.label}>
            <div className="mb-1 flex justify-between text-xs text-[var(--fg-muted)]">
              <span>{s.label}</span>
              <span>
                {s.meta ??
                  (s.value >= 1000 ? s.value.toLocaleString() : String(s.value))}
              </span>
            </div>
            <div className="pp-deal-report-chart__track h-3 rounded-full">
              <div
                className="pp-deal-report-chart__fill h-3 rounded-full"
                style={{ width: `${Math.round((s.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
    </ChartShell>
  );
}
