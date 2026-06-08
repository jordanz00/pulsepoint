import type { MetricTrend } from "@/lib/insights-trends";
import { GlassAreaChart } from "@/components/charts/glass-area-chart";
import type { ChartPoint } from "@/lib/motion/chart-samples";

function formatTrendValue(value: number, unit: string) {
  if (unit === "usd") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function toChartPoints(trend: MetricTrend): ChartPoint[] {
  return trend.points.map((p) => ({
    label: p.takenAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: p.value,
  }));
}

export function InsightsTrendPanel({ trends }: { trends: MetricTrend[] }) {
  if (trends.length === 0) {
    return (
      <section className="glass pp-insights-trends pp-insights-trends--empty">
        <h2 className="pc-simple-section-title">Trend history</h2>
        <p className="pc-simple-section-lead mt-2">
          Capture a snapshot on this page to start period-over-period tracking. Each capture stores
          revenue and membership KPIs for board-ready comparisons.
        </p>
      </section>
    );
  }

  return (
    <section className="pp-insights-trends" aria-labelledby="insights-trends-heading">
      <h2 id="insights-trends-heading" className="pc-simple-section-title">
        Trend history
      </h2>
      <p className="pc-simple-section-lead mt-1">
        Period-over-period change from saved snapshots—use before finance and board meetings.
      </p>
      <div className="pp-insights-trends-grid mt-6">
        {trends.map((trend) => (
          <article key={trend.metricKey} className="glass pp-insights-trend-card">
            <div className="pp-insights-trend-head">
              <h3 className="text-sm font-semibold text-[var(--pc-text)]">{trend.label}</h3>
              {trend.deltaPct != null ? (
                <span
                  className={
                    trend.deltaPct >= 0
                      ? "pp-insights-trend-delta pp-insights-trend-delta--up"
                      : "pp-insights-trend-delta pp-insights-trend-delta--down"
                  }
                >
                  {trend.deltaPct >= 0 ? "+" : ""}
                  {trend.deltaPct}%
                </span>
              ) : (
                <span className="text-xs text-[var(--pc-text-tertiary)]">First snapshot</span>
              )}
            </div>
            {trend.latest != null ? (
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--pc-text)]">
                {formatTrendValue(trend.latest, trend.unit)}
              </p>
            ) : null}
            {trend.points.length >= 2 ? (
              <div className="mt-4">
                <GlassAreaChart
                  data={toChartPoints(trend)}
                  height={120}
                  ariaLabel={`${trend.label} trend`}
                  valueSuffix={trend.unit === "usd" ? "" : ""}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
