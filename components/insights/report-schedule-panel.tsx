"use client";

import { useState, useTransition } from "react";
import { REPORT_METRIC_CATALOG } from "@/lib/report-metric-catalog";
import {
  createReportSchedule,
  deleteReportSchedule,
  runReportScheduleNow,
  toggleReportSchedule,
} from "@/app/actions/reports";

const DEFAULT_METRICS = [
  "revenue.total",
  "revenue.dues",
  "members.active",
  "members.renewal_due_30",
  "membership.retention_pct",
];

export function ReportSchedulePanel({
  orgSlug,
  schedules,
}: {
  orgSlug: string;
  schedules: {
    id: string;
    name: string;
    cadence: string;
    active: boolean;
    nextRunAt: Date | null;
    lastRunAt: Date | null;
  }[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [emailBanner, setEmailBanner] = useState<{
    recipients: string[];
  } | null>(null);
  const [selected, setSelected] = useState<string[]>(DEFAULT_METRICS);

  return (
    <section className="pc-card space-y-4 pp-report-schedule">
      <div>
        <h2 className="pc-section-title">Scheduled reports & snapshots</h2>
        <p className="pc-section-lead">
          Active schedules run automatically via platform cron (<code className="text-xs">/api/cron/platform</code>
          )—each run saves Insights snapshots and emails recipients through your Engage adapter.
        </p>
      </div>

      {emailBanner ? (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          <p className="font-semibold">Report delivered</p>
          <p className="mt-1">
            Snapshots saved and delivery simulated to {emailBanner.recipients.join(", ")}.
          </p>
        </div>
      ) : null}

      {schedules.length > 0 ? (
        <ul className="pc-simple-list">
          {schedules.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">
                  {s.name}
                  {!s.active ? (
                    <span className="ml-2 text-xs font-normal text-[var(--pc-text-tertiary)]">
                      (paused)
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-[var(--pc-text-secondary)]">
                  {s.cadence} · next {s.nextRunAt ? s.nextRunAt.toLocaleDateString() : "—"}
                  {s.lastRunAt ? ` · last ${s.lastRunAt.toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="pc-btn-secondary text-sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await runReportScheduleNow(orgSlug, s.id);
                      if (res.ok && res.data?.demoEmailSent) {
                        setEmailBanner({ recipients: res.data.recipients });
                        setMsg(
                          `Snapshot saved (${res.data.rows} metrics) · delivery queued.`,
                        );
                      } else {
                        setEmailBanner(null);
                        setMsg(res.ok ? "Report run complete." : res.error);
                      }
                    })
                  }
                >
                  Run now
                </button>
                <button
                  type="button"
                  className="pc-btn-secondary text-sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await toggleReportSchedule(orgSlug, s.id, !s.active);
                      setMsg(res.ok ? (s.active ? "Schedule paused." : "Schedule resumed.") : res.error);
                    })
                  }
                >
                  {s.active ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`Delete schedule "${s.name}"?`)) return;
                    startTransition(async () => {
                      const res = await deleteReportSchedule(orgSlug, s.id);
                      setMsg(res.ok ? "Schedule deleted." : res.error);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--pc-text-secondary)]">
          No schedules yet. Create a monthly board pack below—demo seed includes one if you ran{" "}
          <code className="text-xs">seed:demo</code>.
        </p>
      )}

      <form
        className="space-y-3 border-t border-[var(--pc-border)] pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await createReportSchedule(orgSlug, {
              name: String(fd.get("name") ?? "Board KPI pack"),
              metricKeys: selected,
              cadence: String(fd.get("cadence") ?? "MONTHLY") as
                | "WEEKLY"
                | "MONTHLY"
                | "QUARTERLY",
              recipients: [String(fd.get("email") ?? "")],
            });
            setMsg(res.ok ? "Schedule created." : res.error);
          });
        }}
      >
        <input name="name" placeholder="Report name" className="pc-input" required />
        <input name="email" type="email" placeholder="Recipient email" className="pc-input" required />
        <select name="cadence" className="pc-select">
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
        </select>
        <fieldset>
          <legend className="text-sm font-medium">Metrics (saved as Insights snapshots)</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {REPORT_METRIC_CATALOG.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={(e) => {
                    setSelected((prev) =>
                      e.target.checked ? [...prev, m.id] : prev.filter((x) => x !== m.id),
                    );
                  }}
                />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="pc-btn-primary text-sm" disabled={pending}>
          Create schedule
        </button>
      </form>
      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </section>
  );
}
