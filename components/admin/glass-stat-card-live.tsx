"use client";

import type { PeriodDelta } from "@/lib/dashboard-glass";
import type { DashboardTopic } from "@/lib/dashboard-topic-colors";
import { topicCardClass } from "@/lib/dashboard-topic-colors";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { GlassAreaChart } from "@/components/charts/glass-area-chart";
import type { ChartPoint } from "@/lib/motion/chart-samples";

export type GlassStatCardLiveProps = {
  label: string;
  /** Pre-formatted fallback when numericValue is omitted */
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: PeriodDelta | null;
  /** Hero executive strip — larger numerals */
  hero?: boolean;
  /** Semantic color topic for CEO overview */
  topic?: DashboardTopic;
  /** Optional sparkline under the value */
  sparklineData?: ChartPoint[];
};

/** Glass KPI with count-up animation when numericValue is provided. */
export function GlassStatCardLive({
  label,
  value,
  numericValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  delta,
  hero = false,
  topic,
  sparklineData,
}: GlassStatCardLiveProps) {
  const topicCls = topic ? topicCardClass(topic) : "";
  return (
    <article
      className={`pp-glass-stat-card glass pp-glass-surface pp-motion-card${hero ? " pp-glass-stat-card--hero" : ""}${topicCls ? ` ${topicCls}` : ""}`}
    >
      {topic ? (
        <span className={`pp-topic-swatch pp-topic-swatch--${topic} pp-glass-stat-topic`} aria-hidden />
      ) : null}
      <p className="pp-glass-stat-label">{label}</p>
      <p className={`pp-glass-stat-value${hero ? " pp-glass-stat-value--hero" : ""}`}>
        {numericValue !== undefined ? (
          <AnimatedNumber
            value={numericValue}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        ) : (
          value
        )}
      </p>
      {delta ? (
        <p
          className={`pp-glass-stat-delta pp-glass-stat-delta--${delta.direction}`}
          aria-label={`Change: ${delta.label}`}
        >
          {delta.label}
        </p>
      ) : null}
      {sparklineData && sparklineData.length > 1 ? (
        <div className="pp-glass-stat-sparkline mt-2">
          <GlassAreaChart
            data={sparklineData}
            height={hero ? 40 : 32}
            variant="sparkline"
            ariaLabel={`Trend for ${label}`}
          />
        </div>
      ) : null}
    </article>
  );
}
