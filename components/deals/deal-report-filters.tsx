"use client";

import type { DealReportFilters } from "@/lib/deals/report-filters";

type Pipeline = { id: string; name: string };

export function DealReportFiltersBar({
  pipelines,
  filters,
  onChange,
  hint,
}: {
  pipelines: Pipeline[];
  filters: DealReportFilters;
  onChange: (next: DealReportFilters) => void;
  hint?: string;
}) {
  return (
    <div className="pc-card space-y-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">Pipeline</span>
          <select
            className="pc-input min-w-[10rem]"
            value={filters.pipelineId ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                pipelineId: e.target.value || undefined,
              })
            }
          >
            <option value="">All pipelines</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">Rep (name)</span>
          <input
            className="pc-input min-w-[10rem]"
            placeholder="Any rep"
            value={filters.assigneeName ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                assigneeName: e.target.value || undefined,
              })
            }
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">From</span>
          <input
            type="date"
            className="pc-input"
            value={filters.dateFrom?.slice(0, 10) ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                dateFrom: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
              })
            }
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-500">To</span>
          <input
            type="date"
            className="pc-input"
            value={filters.dateTo?.slice(0, 10) ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                dateTo: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined,
              })
            }
          />
        </label>
        <button
          type="button"
          className="pc-btn-secondary text-sm"
          onClick={() => onChange({})}
        >
          Clear filters
        </button>
      </div>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
