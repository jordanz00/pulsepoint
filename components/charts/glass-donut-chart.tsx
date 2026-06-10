"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { useChartContainerReady } from "@/components/charts/use-chart-container-ready";

export type DonutSlice = { name: string; value: number; color: string };

export function GlassDonutChart({
  data,
  height = 140,
  ariaLabel,
  centerLabel,
  centerValue,
  variant = "default",
}: {
  data: DonutSlice[];
  height?: number;
  ariaLabel: string;
  centerLabel?: string;
  centerValue?: string;
  variant?: "default" | "compact";
}) {
  const reduced = usePrefersReducedMotion();
  const ready = useChartContainerReady();
  const compact = variant === "compact";

  if (!ready) {
    return (
      <div
        className={`pp-glass-donut${compact ? " pp-glass-donut--compact" : ""}`}
        style={{ height, width: "100%", minWidth: 0 }}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <div
      className={`pp-glass-donut${compact ? " pp-glass-donut--compact" : ""}`}
      style={{ height, width: "100%", minWidth: 0 }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={compact ? "58%" : "58%"}
            outerRadius={compact ? "72%" : "82%"}
            paddingAngle={2}
            cx="50%"
            cy="50%"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1}
            isAnimationActive={!reduced}
            animationDuration={900}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const p = payload[0].payload as DonutSlice;
              return (
                <div className="pp-glass-chart-tooltip">
                  <span className="pp-glass-chart-tooltip-label">{p.name}</span>
                  <span className="pp-glass-chart-tooltip-value">{p.value}%</span>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel ? (
        <div className="pp-glass-donut-center" aria-hidden>
          {centerValue ? <span className="pp-glass-donut-value">{centerValue}</span> : null}
          <span className="pp-glass-donut-label">{centerLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
