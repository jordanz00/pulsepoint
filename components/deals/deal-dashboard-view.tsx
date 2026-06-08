"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DealReportChart } from "@/components/deals/deal-report-chart";
import { DealReportFiltersBar } from "@/components/deals/deal-report-filters";
import type { DealReportDashboardView } from "@/lib/deals/report-views";
import type { DealReportFilters } from "@/lib/deals/report-filters";
import { computeReport } from "@/lib/deals/reports";
import { mergeFilters } from "@/lib/deals/report-filters";

type Pipeline = { id: string; name: string };

export function DealDashboardView({
  orgSlug,
  dashboardId,
  initial,
  pipelines,
  dealsJson,
  reasonLabelsJson,
}: {
  orgSlug: string;
  dashboardId: string;
  initial: DealReportDashboardView;
  pipelines: Pipeline[];
  dealsJson: string;
  reasonLabelsJson: string;
}) {
  const [viewFilters, setViewFilters] = useState<DealReportFilters>({});

  const deals = useMemo(() => JSON.parse(dealsJson) as Parameters<typeof computeReport>[1], [dealsJson]);
  const reasonLabels = useMemo(
    () => new Map<string, string>(JSON.parse(reasonLabelsJson) as [string, string][]),
    [reasonLabelsJson],
  );

  const widgets = useMemo(() => {
    const merged = { ...initial.filters, ...viewFilters };
    return initial.widgets.map((w) => {
      const filters = mergeFilters(merged, w.filters);
      return {
        ...w,
        filters,
        result: computeReport(w.reportType, deals, filters, reasonLabels),
      };
    });
  }, [initial, viewFilters, deals, reasonLabels]);

  return (
    <div className="space-y-6">
      <DealReportFiltersBar
        pipelines={pipelines}
        filters={viewFilters}
        onChange={setViewFilters}
        hint="View filters apply while you stay on this screen — they reset when you leave Reports."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((w) => (
          <article key={w.id} className="pc-card p-4">
            <h3 className="font-semibold text-zinc-900">{w.title}</h3>
            <p className="mb-3 text-xs uppercase tracking-wide text-zinc-400">{w.reportType}</p>
            <DealReportChart chartType={w.chartType} result={w.result} />
          </article>
        ))}
      </div>

      <p className="text-center text-sm">
        <Link
          href={`/${orgSlug}/deals/reports/${dashboardId}/edit`}
          className="font-medium text-[var(--pc-brand)]"
        >
          Customize dashboard →
        </Link>
      </p>
    </div>
  );
}
