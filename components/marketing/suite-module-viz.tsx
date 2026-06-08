"use client";

import { useMemo } from "react";
import { PRODUCT_DEMO_VIZ } from "@/lib/suite-module-demo-viz";
import type { ProductId } from "@/lib/products";

export function SuiteModuleViz({ productId }: { productId: ProductId }) {
  const viz = PRODUCT_DEMO_VIZ[productId];
  const max = useMemo(
    () => Math.max(...viz.chart.map((p) => p.value), 1),
    [viz.chart],
  );

  return (
    <div className="mk-suite-viz" aria-label={`${viz.chartTitle} sample chart`}>
      <p className="mk-suite-viz-title">{viz.chartTitle}</p>
      <div className="mk-suite-viz-chart">
        {viz.chart.map((point, i) => (
          <div key={`${point.label}-${i}`} className="mk-suite-viz-bar-col">
            <div className="mk-suite-viz-bar-track">
              <div
                className="mk-suite-viz-bar-fill"
                style={{
                  height: `${Math.round((point.value / max) * 100)}%`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </div>
            <span className="mk-suite-viz-bar-label">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="mk-suite-viz-stats">
        {viz.stats.map((stat) => (
          <div key={stat.label} className="mk-suite-viz-stat">
            <span className="mk-suite-viz-stat-value">{stat.value}</span>
            <span className="mk-suite-viz-stat-label">{stat.label}</span>
            {stat.delta ? (
              <span
                className={`mk-suite-viz-stat-delta mk-suite-viz-stat-delta--${stat.trend ?? "flat"}`}
              >
                {stat.delta}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mk-suite-viz-foot">Sample demo data · not production metrics</p>
    </div>
  );
}
