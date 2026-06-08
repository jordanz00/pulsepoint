"use client";

import Link from "next/link";
import { useState } from "react";
import { exportMembersCsv } from "@/app/actions/members";

type DemoQuickExportsProps = {
  orgSlug: string;
  memberCount: number;
  variant?: "section" | "inline";
};

export function DemoQuickExports({ orgSlug, memberCount, variant = "section" }: DemoQuickExportsProps) {
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    setExportMsg(null);
    const result = await exportMembersCsv(orgSlug);
    setExporting(false);
    if (!result.ok || !result.data) {
      setExportMsg(!result.ok ? result.error : "Export failed");
      return;
    }
    const blob = new Blob([result.data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsepoint-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("Download started");
  }

  if (variant === "inline") {
    return (
      <section className="pp-demo-export-inline glass pp-glass-surface" aria-label="Data export">
        <div className="pp-demo-export-inline__copy">
          <p className="pp-demo-export-inline__title">
            {memberCount.toLocaleString()} members · export anytime
          </p>
          <p className="pp-demo-export-inline__sub">No IT ticket for a CSV pull.</p>
          {exportMsg ? (
            <p className="pp-demo-export-inline__msg" role="status">
              {exportMsg}
            </p>
          ) : null}
        </div>
        <div className="pp-demo-export-inline__actions">
          <button
            type="button"
            className="pc-btn-primary text-sm"
            onClick={handleExport}
            disabled={exporting}
            aria-label="Export member directory as CSV"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <Link href={`/${orgSlug}/insights`} className="pc-btn-secondary text-sm">
            Reports
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pp-demo-stagger pp-demo-export-section" aria-label="Data export">
      <div className="pp-demo-section-head pp-topic-section-head--members">
        <h2 className="pp-demo-section-title pp-demo-section-title--in-head">Export & reporting</h2>
        <p className="pp-demo-section-sub">
          Pull member data or open Insights—no IT ticket required for a CSV export.
        </p>
      </div>
      <div className="pp-demo-export-bar glass pp-glass-surface pp-topic-card pp-topic-card--members">
        <div className="pp-demo-export-bar-info">
          <p className="pp-demo-export-bar-headline">
            <span className="pp-demo-export-bar-count">{memberCount.toLocaleString()}</span>
            <span className="pp-demo-export-bar-count-label">members in directory</span>
          </p>
          <p className="pp-demo-export-bar-sub">Export anytime, no setup required</p>
          {exportMsg ? (
            <p className="pp-demo-export-bar-msg" role="status">
              {exportMsg}
            </p>
          ) : null}
        </div>
        <div className="pp-demo-export-bar-actions">
          <button
            type="button"
            className="pp-demo-export-btn"
            onClick={handleExport}
            disabled={exporting}
            aria-label="Export member directory as CSV"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 1v8M4 6l3 3 3-3M2 11h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {exporting ? "Exporting…" : "Export members CSV"}
          </button>
          <Link href={`/${orgSlug}/insights`} className="pp-demo-export-btn pp-demo-export-btn--ghost">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="7" width="3" height="6" rx="1" fill="currentColor" opacity=".5" />
              <rect x="5.5" y="4" width="3" height="9" rx="1" fill="currentColor" opacity=".7" />
              <rect x="10" y="1" width="3" height="12" rx="1" fill="currentColor" />
            </svg>
            Full reports
          </Link>
        </div>
      </div>
    </section>
  );
}
