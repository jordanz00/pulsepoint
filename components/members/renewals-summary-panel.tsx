"use client";

import { useState, useTransition } from "react";
import { exportRenewalsDueCsv } from "@/app/actions/renewals";

export function RenewalsSummaryPanel({
  orgSlug,
  total,
  overdue,
  dueSoon,
  cronEnabled,
  cronLabel,
  cronHint,
}: {
  orgSlug: string;
  total: number;
  overdue: number;
  dueSoon: number;
  cronEnabled: boolean;
  cronLabel: string;
  cronHint: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="pc-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="pc-section-title">Renewal pulse</h2>
          <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
            Due in 90 days — export for board packets or finance reconciliation.
          </p>
        </div>
        <span className={cronEnabled ? "badge-live" : "badge-alpha"}>{cronLabel}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--pc-border)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--pc-brand)]">{total}</p>
          <p className="text-xs uppercase tracking-wide text-[var(--pc-text-secondary)]">
            Due in window
          </p>
        </div>
        <div className="rounded-xl border border-[var(--pc-border)] p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{dueSoon}</p>
          <p className="text-xs uppercase tracking-wide text-[var(--pc-text-secondary)]">
            Next 30 days
          </p>
        </div>
        <div className="rounded-xl border border-[var(--pc-border)] p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{overdue}</p>
          <p className="text-xs uppercase tracking-wide text-[var(--pc-text-secondary)]">
            Overdue
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--pc-text-tertiary)]">{cronHint}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="pc-btn-secondary text-sm"
          disabled={pending || total === 0}
          onClick={() => {
            startTransition(async () => {
              setMsg(null);
              const res = await exportRenewalsDueCsv(orgSlug, 90);
              if (!res.ok) {
                setMsg(res.error);
                return;
              }
              const blob = new Blob([res.data!.csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `renewals-due-${orgSlug}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              setMsg(`Exported ${res.data!.count} member(s).`);
            });
          }}
        >
          {pending ? "Exporting…" : "Export renewals CSV"}
        </button>
        {msg ? (
          <span className="text-xs text-[var(--pc-text-secondary)]" role="status">
            {msg}
          </span>
        ) : null}
      </div>
    </section>
  );
}
