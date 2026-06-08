"use client";

import { useEffect, useState } from "react";
import { WIDGET_CATALOG } from "@/lib/dashboard-widgets";

const DEFAULT_WIDGET_KEYS = [
  "revenue.total",
  "members.active",
  "members.at_risk",
  "events.registrations",
  "revenue.dues",
  "revenue.non_dues",
];

function storageKey(orgSlug: string) {
  return `pulse-insights-layout-${orgSlug}`;
}

function formatValue(metricKey: string, value: number) {
  if (metricKey.startsWith("revenue")) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export function DashboardLayoutEditor({
  orgSlug,
  kpiValues,
}: {
  orgSlug: string;
  kpiValues: Record<string, number>;
}) {
  const [widgetKeys, setWidgetKeys] = useState<string[]>(DEFAULT_WIDGET_KEYS);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(orgSlug));
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((k) => typeof k === "string")) {
        setWidgetKeys(parsed);
      }
    } catch {
      /* ignore corrupt layout */
    }
  }, [orgSlug]);

  function persist(next: string[]) {
    setWidgetKeys(next);
    localStorage.setItem(storageKey(orgSlug), JSON.stringify(next));
    setSavedHint(true);
    window.setTimeout(() => setSavedHint(false), 2000);
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = widgetKeys.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    persist(next);
  }

  function resetLayout() {
    persist(DEFAULT_WIDGET_KEYS);
  }

  const catalogByKey = Object.fromEntries(WIDGET_CATALOG.map((w) => [w.metricKey, w]));

  return (
    <section className="pc-card space-y-4">
      <div>
        <h2 className="pc-section-title">Dashboard layout</h2>
        <p className="pc-section-lead">
          Drag widgets to reorder your executive view. Layout saves in this browser only (
          <code className="text-xs">{storageKey(orgSlug)}</code>).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {widgetKeys.map((key, i) => {
          const meta = catalogByKey[key];
          const title = meta?.title ?? key;
          return (
            <div
              key={key}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) reorder(dragIdx, i);
                setDragIdx(null);
              }}
              className="pc-stat-card cursor-grab active:cursor-grabbing"
            >
              <p className="pc-stat-label">{title}</p>
              <p className="pc-stat-value">{formatValue(key, kpiValues[key] ?? 0)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--pc-border)] pt-4">
        <button type="button" className="pc-btn-secondary text-sm" onClick={resetLayout}>
          Reset layout
        </button>
        {savedHint ? (
          <span className="text-sm text-[var(--pc-text-secondary)]" role="status">
            Layout saved locally.
          </span>
        ) : null}
      </div>
    </section>
  );
}
