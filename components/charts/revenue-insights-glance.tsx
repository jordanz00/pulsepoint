"use client";

import type { CSSProperties } from "react";
import { GlassAreaChart } from "@/components/charts/glass-area-chart";
import { GlassDonutChart } from "@/components/charts/glass-donut-chart";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import type { ChartPoint } from "@/lib/motion/chart-samples";
import { SAMPLE_DONUT, SAMPLE_REVENUE_TREND } from "@/lib/motion/chart-samples";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

export type RevenueGlanceStat = {
  label: string;
  value: string;
  productId: ProductId;
};

const DEFAULT_STATS: RevenueGlanceStat[] = [
  { label: "Dues", value: "$176K", productId: "commerce" },
  { label: "Events", value: "$68K", productId: "events" },
  { label: "Giving", value: "$40K", productId: "giving" },
];

export type RevenueInsightsGlanceProps = {
  productId?: ProductId;
  className?: string;
  data?: ChartPoint[];
  /** e.g. "284" with suffix K */
  headlineValue?: string;
  headlineSuffix?: string;
  headlineLabel?: string;
  deltaLabel?: string;
  stats?: RevenueGlanceStat[];
  duesPct?: number;
  nonDuesPct?: number;
  sample?: boolean;
};

/**
 * Compact executive revenue card — sparkline + mix, aligned with landing-page liquid glass.
 */
export function RevenueInsightsGlance({
  productId = "insights",
  className = "",
  data = SAMPLE_REVENUE_TREND,
  headlineValue,
  headlineSuffix = "K",
  headlineLabel = "MTD revenue",
  deltaLabel,
  stats = DEFAULT_STATS,
  duesPct = 62,
  nonDuesPct = 38,
  sample = true,
}: RevenueInsightsGlanceProps) {
  const trend = data.length ? data : SAMPLE_REVENUE_TREND;
  const latest = trend[trend.length - 1]?.value ?? 0;
  const prior = trend[trend.length - 2]?.value ?? latest;
  const computedDelta =
    prior > 0 ? Math.round(((latest - prior) / prior) * 100) : 0;
  const displayValue = headlineValue ?? String(latest);
  const displayDelta =
    deltaLabel ??
    `${computedDelta >= 0 ? "+" : ""}${computedDelta}% vs prior month${sample ? " · illustrative" : ""}`;

  const donut = [
    { name: "Dues", value: duesPct, color: "var(--mod-insights-fg, #0072bc)" },
    { name: "Non-dues", value: nonDuesPct, color: "var(--mod-commerce-fg, #007870)" },
  ];

  const panelStyle = {
    ...moduleCssVars(productId),
    "--chart-accent": "var(--mod-active-fg)",
  } as CSSProperties;

  return (
    <div className={`mk-revenue-glance mk-mod-glass-panel ${className}`.trim()} style={panelStyle}>
      <div className="mk-revenue-glance-top">
        <div className="mk-revenue-glance-copy">
          <div className="mk-revenue-glance-brand">
            <FeatureIcon icon="insights" productId={productId} size="sm" />
            <span className="mk-revenue-glance-eyebrow">PulsePoint Insights</span>
            {sample ? <span className="badge-alpha">Sample</span> : null}
          </div>
          <p className="mk-revenue-glance-value">
            <span className="mk-stat-number">
              {headlineSuffix === "$" || displayValue.startsWith("$") ? null : (
                <span className="mk-stat-prefix">$</span>
              )}
              <span className="mk-stat-digits">{displayValue.replace(/^\$/, "")}</span>
              {headlineSuffix && headlineSuffix !== "$" ? (
                <span className="mk-stat-suffix">{headlineSuffix}</span>
              ) : null}
            </span>
          </p>
          <p className="mk-revenue-glance-period">{headlineLabel}</p>
          <p className="mk-revenue-glance-delta">{displayDelta}</p>
        </div>
        <div className="mk-revenue-glance-spark" aria-hidden>
          <GlassAreaChart
            data={trend}
            height={56}
            valueSuffix={headlineSuffix === "$" ? "" : headlineSuffix}
            variant="sparkline"
            ariaLabel="Revenue trend sparkline"
          />
        </div>
      </div>

      <div className="mk-revenue-glance-bottom">
        <ul className="mk-revenue-glance-stats">
          {stats.map((s) => (
            <li key={s.label} style={moduleCssVars(s.productId)}>
              <span className="mk-revenue-glance-stat-label">{s.label}</span>
              <span className="mk-revenue-glance-stat-value">{s.value}</span>
            </li>
          ))}
        </ul>
        <div className="mk-revenue-glance-mix" style={moduleCssVars(productId)}>
          <p className="mk-revenue-glance-mix-label">Mix</p>
          <div className="mk-preview-insights-donut-wrap">
            <GlassDonutChart
              data={sample ? [...SAMPLE_DONUT] : donut}
              height={76}
              variant="compact"
              centerLabel="Dues"
              centerValue={`${duesPct}%`}
              ariaLabel="Dues versus non-dues revenue mix"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
