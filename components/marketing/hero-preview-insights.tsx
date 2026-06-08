"use client";

import type { CSSProperties } from "react";
import { GlassAreaChart } from "@/components/charts/glass-area-chart";
import { GlassDonutChart } from "@/components/charts/glass-donut-chart";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { SAMPLE_DONUT, SAMPLE_REVENUE_TREND } from "@/lib/motion/chart-samples";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

const HERO_STATS = [
  { label: "Dues", value: 176, prefix: "$", suffix: "K", productId: "commerce" as const },
  { label: "Events", value: 68, prefix: "$", suffix: "K", productId: "events" as const },
  { label: "Giving", value: 40, prefix: "$", suffix: "K", productId: "giving" as const },
];

/**
 * Hero-only Insights strip — executive revenue infographic for the landing demo.
 */
export function HeroPreviewInsights({
  productId = "insights",
  showDonut = true,
}: {
  productId?: ProductId;
  showDonut?: boolean;
}) {
  const trend = SAMPLE_REVENUE_TREND;
  const latest = trend[trend.length - 1]?.value ?? 0;
  const prior = trend[trend.length - 2]?.value ?? latest;
  const deltaPct = prior > 0 ? Math.round(((latest - prior) / prior) * 100) : 0;

  return (
    <div
      className="mk-preview-insights mk-preview-insights--executive mk-mod-glass-panel"
      style={
        {
          ...moduleCssVars(productId),
          "--chart-accent": "var(--mod-active-fg)",
        } as CSSProperties
      }
    >
      <div className="mk-preview-insights-hero">
        <div className="mk-preview-insights-hero-left">
          <div className="mk-preview-insights-title-row">
            <FeatureIcon icon="insights" productId={productId} size="sm" />
            <span className="mk-preview-eyebrow">Revenue · Insights</span>
            <span className="badge-alpha">Sample</span>
          </div>
          <p className="mk-preview-insights-delta mk-preview-insights-delta--inline">
            <span className={deltaPct >= 0 ? "is-up" : "is-down"}>
              {deltaPct >= 0 ? "+" : ""}
              {deltaPct}%
            </span>{" "}
            vs prior month
          </p>
        </div>
        <div className="mk-preview-insights-metric">
          <div className="mk-preview-insights-value mk-preview-insights-value--hero">
            <AnimatedNumber value={latest} prefix="$" suffix="K" />
          </div>
          <p className="mk-preview-insights-meta">MTD revenue</p>
        </div>
      </div>

      <div className="mk-preview-insights-spark mk-preview-insights-spark--hero" aria-hidden>
        <GlassAreaChart
          data={trend}
          height={64}
          valueSuffix="K"
          variant="sparkline"
          ariaLabel="Six-month revenue sparkline sample"
        />
      </div>

      <div className={`mk-preview-insights-foot${showDonut ? "" : " mk-preview-insights-foot--stats-only"}`}>
        <ul className="mk-preview-insights-stats mk-preview-insights-stats--executive">
          {HERO_STATS.map((s) => (
            <li key={s.label} style={moduleCssVars(s.productId)}>
              <span className="mk-preview-stat-label">{s.label}</span>
              <span className="mk-preview-stat-value">
                <AnimatedNumber
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                />
              </span>
            </li>
          ))}
        </ul>
        {showDonut ? (
          <div className="mk-preview-insights-mix" style={moduleCssVars(productId)}>
            <span className="mk-preview-stat-label">Revenue mix</span>
            <div className="mk-preview-insights-donut-wrap">
              <GlassDonutChart
                data={[...SAMPLE_DONUT]}
                height={84}
                variant="compact"
                centerLabel="Dues"
                centerValue="62%"
                ariaLabel="Sample dues versus non-dues mix"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
