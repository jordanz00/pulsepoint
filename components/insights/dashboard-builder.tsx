"use client";

import { useState, useTransition } from "react";
import { saveDashboardLayout } from "@/app/actions/dashboard";
import { WIDGET_CATALOG, type DashboardWidget } from "@/lib/dashboard-widgets";

export function DashboardBuilder({
  orgSlug,
  initialWidgets,
  kpiValues,
}: {
  orgSlug: string;
  initialWidgets: DashboardWidget[];
  kpiValues: Record<string, number>;
}) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function reorder(from: number, to: number) {
    const next = widgets.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setWidgets(next.map((w, i) => ({ ...w, y: Math.floor(i / 3), x: (i % 3) * 2 })));
  }

  function addWidget(metricKey: string) {
    const cat = WIDGET_CATALOG.find((w) => w.metricKey === metricKey);
    if (!cat) return;
    setWidgets([
      ...widgets,
      {
        id: `w${Date.now()}`,
        metricKey: cat.metricKey,
        title: cat.title,
        x: 0,
        y: widgets.length,
        w: cat.w,
        h: cat.h,
      },
    ]);
  }

  return (
    <section className="pc-card space-y-4">
      <div>
        <h2 className="pc-section-title">Custom dashboard</h2>
        <p className="pc-section-lead">Drag to reorder. Add KPIs from the catalog.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((w, i) => (
          <div
            key={w.id}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null) reorder(dragIdx, i);
              setDragIdx(null);
            }}
            className="pc-stat-card cursor-grab active:cursor-grabbing"
          >
            <p className="pc-stat-label">{w.title}</p>
            <p className="pc-stat-value">
              {w.metricKey.startsWith("revenue")
                ? `$${(kpiValues[w.metricKey] ?? 0).toLocaleString()}`
                : (kpiValues[w.metricKey] ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--pc-border)] pt-4">
        {WIDGET_CATALOG.filter((c) => !widgets.some((w) => w.metricKey === c.metricKey)).map((c) => (
          <button
            key={c.metricKey}
            type="button"
            className="pc-btn-secondary text-xs"
            onClick={() => addWidget(c.metricKey)}
          >
            + {c.title}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="pc-btn-primary text-sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await saveDashboardLayout(orgSlug, {
              name: "Executive dashboard",
              widgets,
            });
            setMsg(res.ok ? "Dashboard saved." : res.error);
          })
        }
      >
        {pending ? "Saving…" : "Save layout"}
      </button>
      {msg ? <p className="text-sm text-[var(--pc-text-secondary)]">{msg}</p> : null}
    </section>
  );
}
