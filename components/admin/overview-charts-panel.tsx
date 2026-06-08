"use client";

import type { ChartPoint } from "@/lib/motion/chart-samples";
import { RevenueInsightsGlance } from "@/components/charts/revenue-insights-glance";
import { RevealOnView } from "@/components/motion/reveal-on-view";

export function OverviewChartsPanel({
  revenueTrend,
  duesPct,
  nonDuesPct,
}: {
  revenueTrend: ChartPoint[];
  duesPct: number;
  nonDuesPct: number;
}) {
  const latest = revenueTrend[revenueTrend.length - 1]?.value ?? 0;
  const prior = revenueTrend[revenueTrend.length - 2]?.value ?? latest;
  const deltaPct = prior > 0 ? Math.round(((latest - prior) / prior) * 100) : 0;

  return (
    <RevealOnView className="pp-overview-charts">
      <RevenueInsightsGlance
        data={revenueTrend}
        headlineValue={latest.toLocaleString()}
        headlineSuffix=""
        headlineLabel="Month to date · paid registrations & orders"
        deltaLabel={`${deltaPct >= 0 ? "+" : ""}${deltaPct}% vs prior month`}
        duesPct={duesPct}
        nonDuesPct={nonDuesPct}
        sample={false}
        stats={[
          { label: "Dues share", value: `${duesPct}%`, productId: "commerce" },
          { label: "Non-dues", value: `${nonDuesPct}%`, productId: "events" },
          { label: "Period", value: "6 mo", productId: "work" },
        ]}
      />
    </RevealOnView>
  );
}
