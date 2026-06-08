"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DealReportFiltersBar } from "@/components/deals/deal-report-filters";
import { DealReportChart } from "@/components/deals/deal-report-chart";
import {
  addDealReportWidget,
  deleteDealReportWidget,
  updateDealReportDashboard,
  updateDealReportWidget,
} from "@/app/actions/deal-reports";
import type { DealReportDashboardView } from "@/lib/deals/report-views";
import type { DealReportFilters } from "@/lib/deals/report-filters";
import { DEAL_REPORT_LABEL } from "@/lib/deals/constants";
import { computeReport } from "@/lib/deals/reports";
import { mergeFilters } from "@/lib/deals/report-filters";

type Pipeline = { id: string; name: string };

const ADDABLE_REPORTS = Object.entries(DEAL_REPORT_LABEL);

export function DealDashboardEditor({
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [dashFilters, setDashFilters] = useState<DealReportFilters>(initial.filters);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);

  const deals = JSON.parse(dealsJson) as Parameters<typeof computeReport>[1];
  const reasonLabels = new Map<string, string>(
    JSON.parse(reasonLabelsJson) as [string, string][],
  );

  function saveDashboardFilters(next: DealReportFilters) {
    setDashFilters(next);
    startTransition(async () => {
      const res = await updateDealReportDashboard(orgSlug, dashboardId, { filters: next });
      setMsg(res.ok ? "Saved dashboard filters." : res.error ?? "Save failed");
      router.refresh();
    });
  }

  function saveMeta() {
    startTransition(async () => {
      const res = await updateDealReportDashboard(orgSlug, dashboardId, {
        name,
        description,
      });
      setMsg(res.ok ? "Dashboard updated." : res.error ?? "Save failed");
      router.refresh();
    });
  }

  const widgets = initial.widgets.map((w) => {
    const filters = mergeFilters(dashFilters, w.filters);
    return {
      ...w,
      result: computeReport(w.reportType, deals, filters, reasonLabels),
    };
  });

  return (
    <div className="space-y-6">
      <div className="pc-card space-y-4 p-4">
        <h2 className="pc-section-title">Dashboard settings</h2>
        <label className="block text-sm">
          <span className="text-zinc-500">Name</span>
          <input
            className="pc-input mt-1 w-full max-w-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Description</span>
          <textarea
            className="pc-input mt-1 w-full max-w-lg"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button type="button" className="pc-btn-primary text-sm" disabled={pending} onClick={saveMeta}>
          Save name & description
        </button>
      </div>

      <DealReportFiltersBar
        pipelines={pipelines}
        filters={dashFilters}
        onChange={saveDashboardFilters}
        hint="Edit filters are saved to this dashboard and persist when you leave Reports."
      />

      <div className="flex flex-wrap gap-2">
        {ADDABLE_REPORTS.map(([type, label]) => (
          <button
            key={type}
            type="button"
            className="pc-btn-secondary text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await addDealReportWidget(orgSlug, dashboardId, {
                  reportType: type,
                  title: label,
                });
                setMsg(res.ok ? `Added ${label}` : res.error ?? "Failed");
                router.refresh();
              })
            }
          >
            + {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((w) => (
          <article key={w.id} className="pc-card p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <input
                className="pc-input flex-1 text-sm font-semibold"
                value={w.title}
                onChange={(e) =>
                  startTransition(async () => {
                    await updateDealReportWidget(orgSlug, w.id, { title: e.target.value });
                    router.refresh();
                  })
                }
              />
              <button
                type="button"
                className="text-xs text-red-600"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteDealReportWidget(orgSlug, w.id);
                    setMsg(res.ok ? "Widget removed." : res.error ?? "Failed");
                    router.refresh();
                  })
                }
              >
                Remove
              </button>
            </div>
            <select
              className="pc-input mb-3 w-full text-xs"
              value={w.chartType}
              onChange={(e) =>
                startTransition(async () => {
                  await updateDealReportWidget(orgSlug, w.id, { chartType: e.target.value });
                  router.refresh();
                })
              }
            >
              <option value="BAR">Bar</option>
              <option value="DONUT">Donut</option>
              <option value="TABLE">Table</option>
            </select>
            <DealReportChart chartType={w.chartType} result={w.result} />
          </article>
        ))}
      </div>

      {msg ? <p className="text-sm text-zinc-600">{msg}</p> : null}

      <p className="text-center text-sm">
        <Link href={`/${orgSlug}/deals/reports/${dashboardId}`} className="font-medium text-[var(--pc-brand)]">
          ← Back to view mode
        </Link>
      </p>
    </div>
  );
}
