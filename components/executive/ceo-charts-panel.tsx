"use client";

import type { ChartPoint } from "@/lib/motion/chart-samples";
import { GlassAreaChart } from "@/components/charts/glass-area-chart";
import { RevenueInsightsGlance } from "@/components/charts/revenue-insights-glance";

export function CeoChartsPanel({
  membershipTrend,
  revenueTrend,
  revenueMtd,
  revenueDeltaPct,
  duesPct,
  nonDuesPct,
}: {
  membershipTrend: ChartPoint[];
  revenueTrend: ChartPoint[];
  revenueMtd: number;
  revenueDeltaPct: number | null;
  duesPct: number;
  nonDuesPct: number;
}) {
  const latestMembers = membershipTrend[membershipTrend.length - 1]?.value ?? 0;
  const priorMembers = membershipTrend[membershipTrend.length - 2]?.value ?? latestMembers;
  const memberDeltaPct =
    priorMembers > 0 ? Math.round(((latestMembers - priorMembers) / priorMembers) * 100) : 0;

  const fmtUsd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(revenueMtd / 100);

  return (
    <div className="ceo-charts-grid">
      <section className="ceo-chart-card ds-card ds-glass" aria-label="Membership growth">
        <header className="ceo-panel__head ceo-panel__head--compact">
          <div>
            <p className="ceo-panel__eyebrow">Membership</p>
            <h2 className="ceo-panel__title">Growth trend</h2>
          </div>
          <p className="ceo-chart-card__stat">
            {latestMembers} joined
            <span className="ceo-chart-card__stat-meta">
              {memberDeltaPct >= 0 ? "+" : ""}
              {memberDeltaPct}% vs prior month
            </span>
          </p>
        </header>
        <GlassAreaChart
          data={membershipTrend}
          height={200}
          ariaLabel="New members per month, last twelve months"
          variant="default"
        />
      </section>

      <section className="ceo-chart-card ds-card ds-glass ceo-chart-card--revenue" aria-label="Revenue">
        <RevenueInsightsGlance
          data={revenueTrend}
          headlineValue={fmtUsd}
          headlineSuffix=""
          headlineLabel="Month-to-date revenue"
          deltaLabel={
            revenueDeltaPct !== null
              ? `${revenueDeltaPct >= 0 ? "+" : ""}${revenueDeltaPct}% vs last month`
              : "No prior-month comparison"
          }
          duesPct={duesPct}
          nonDuesPct={nonDuesPct}
          sample={false}
          stats={[
            { label: "Dues share", value: `${duesPct}%`, productId: "commerce" },
            { label: "Non-dues", value: `${nonDuesPct}%`, productId: "events" },
            { label: "Period", value: "6 mo", productId: "insights" },
          ]}
        />
      </section>
    </div>
  );
}
