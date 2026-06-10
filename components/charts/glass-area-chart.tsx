"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/motion/chart-samples";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { useChartContainerReady } from "@/components/charts/use-chart-container-ready";

type GlassAreaChartProps = {
  data: ChartPoint[];
  height?: number;
  valueSuffix?: string;
  ariaLabel: string;
  className?: string;
  /** Compact sparkline — no axis labels, for executive summary strips */
  variant?: "default" | "sparkline";
};

export function GlassAreaChart({
  data,
  height = 160,
  valueSuffix = "",
  ariaLabel,
  className = "",
  variant = "default",
}: GlassAreaChartProps) {
  const reduced = usePrefersReducedMotion();
  const ready = useChartContainerReady();
  const gradId = useId().replace(/:/g, "");
  const isSparkline = variant === "sparkline";

  if (!ready) {
    return (
      <div
        className={`pp-glass-chart${isSparkline ? " pp-glass-chart--sparkline" : ""} ${className}`.trim()}
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <div
      className={`pp-glass-chart${isSparkline ? " pp-glass-chart--sparkline" : ""} ${className}`.trim()}
      style={{ height, width: "100%", minWidth: 0 }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={
            isSparkline
              ? { top: 4, right: 0, left: 0, bottom: 0 }
              : { top: 8, right: 8, left: -18, bottom: 0 }
          }
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-accent, #0072bc)" stopOpacity={0.38} />
              <stop offset="100%" stopColor="var(--chart-accent, #0072bc)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {!isSparkline ? (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--glass-fg-subtle, var(--text-muted))", fontSize: 11 }}
              dy={4}
            />
          ) : null}
          <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
          {!isSparkline ? (
            <Tooltip
              cursor={{ stroke: "var(--glass-border)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as ChartPoint;
                return (
                  <div className="pp-glass-chart-tooltip">
                    <span className="pp-glass-chart-tooltip-label">{p.label}</span>
                    <span className="pp-glass-chart-tooltip-value">
                      {p.value.toLocaleString()}
                      {valueSuffix}
                    </span>
                  </div>
                );
              }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--chart-accent, #0072bc)"
            strokeWidth={isSparkline ? 1.75 : 2}
            fill={`url(#${gradId})`}
            isAnimationActive={!reduced}
            animationDuration={isSparkline ? 800 : 1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
