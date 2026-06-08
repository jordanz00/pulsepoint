"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { ExecutiveKpiNumber } from "@/components/marketing/executive-kpi-number";
import { RevenueInsightsGlance } from "@/components/charts/revenue-insights-glance";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { INSIGHTS_PREVIEW_KPIS, INSIGHTS_PREVIEW_LINES } from "@/lib/insights-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";
import { modGlassKpiProps } from "@/lib/marketing-module-glass";

const FOCUS_KPI: Record<string, number> = {
  revenue: 0,
  renewals: 1,
  exports: 0,
};

const FOCUS_PANEL: Record<string, "chart" | "pipeline" | "export"> = {
  revenue: "chart",
  renewals: "pipeline",
  exports: "export",
};

export function InsightsMarketingPreview({
  demoHref = "/demo-healthcare/insights",
  focus = "revenue",
}: {
  demoHref?: string;
  focus?: "revenue" | "renewals" | "exports";
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [kpiFocus, setKpiFocus] = useState(FOCUS_KPI[focus] ?? 0);
  const panel = FOCUS_PANEL[focus] ?? "chart";

  useEffect(() => {
    setKpiFocus(FOCUS_KPI[focus] ?? 0);
  }, [focus]);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  return (
    <div
      className={`mk-ins-preview-shell mk-liquid-glass pp-glass-interactive${ready ? " mk-ins-preview-shell--ready" : ""}`}
      role="region"
      aria-label="Interactive Insights preview"
    >
      <div className="mk-mc-preview-shine" aria-hidden />
      <div className="mk-preview-ambient" aria-hidden />
      <div className="mk-mc-preview-inner">
        <header className="mk-mc-preview-chrome">
          <div className="mk-mc-preview-chrome-left">
            <FeatureIcon icon="insights" productId="insights" />
            <div>
              <p className="mk-mc-preview-chrome-title">Executive overview</p>
              <p className="mk-mc-preview-chrome-sub">
                <span className="mk-mc-preview-live-dot" aria-hidden />
                Revenue · renewals · exports
              </p>
            </div>
          </div>
          <Link href={demoHref} className="btn btn-primary mk-mc-preview-cta mk-preview-cta-shine">
            Open workspace
          </Link>
        </header>

        <div className="mk-mc-preview-kpis mk-mc-preview-kpis--executive" aria-label="Revenue metrics">
          {INSIGHTS_PREVIEW_KPIS.map((kpi, i) => {
            const glass = modGlassKpiProps(kpi.productId, kpiFocus === i);
            return (
              <button
                key={kpi.id}
                type="button"
                {...glass}
                className={`${glass.className} mk-preview-hit`}
                aria-pressed={kpiFocus === i}
                onClick={() => setKpiFocus(i)}
              >
                <span className="mk-mc-preview-kpi-label">{kpi.label}</span>
                <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
                  <ExecutiveKpiNumber
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                  />
                </span>
                <span className="mk-mc-preview-kpi-meta">{kpi.meta}</span>
              </button>
            );
          })}
        </div>

        <div className="mk-mc-preview-analytics-deck">
          {panel === "chart" ? (
            <div
              className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel mk-ins-preview-chart pp-ins-preview-panel--full"
              style={moduleCssVars("insights")}
            >
              <p className="mk-mc-preview-panel-label">Revenue trend</p>
              <RevenueInsightsGlance
                className="mk-revenue-glance--embedded mk-revenue-glance--preview"
                headlineValue="284"
                headlineSuffix="K"
                deltaLabel="+8% vs prior month"
              />
            </div>
          ) : null}

          {panel === "pipeline" ? (
            <div
              className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-ins-preview-panel--full"
              style={moduleCssVars("members")}
            >
              <p className="mk-mc-preview-panel-label">Renewal & engagement signals</p>
              <ul className="mk-ins-preview-lines">
                {INSIGHTS_PREVIEW_LINES.map((line) => (
                  <li key={line.id} style={moduleCssVars(line.productId)}>
                    <span className="mk-ins-preview-line-label">{line.label}</span>
                    <span className="mk-ins-preview-line-value">
                      <AnimatedNumber
                        value={line.value}
                        prefix={"prefix" in line ? line.prefix : ""}
                        suffix={line.suffix}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {panel === "export" ? (
            <div
              className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-ins-preview-export pp-ins-preview-panel--full"
              style={moduleCssVars("work")}
            >
              <p className="mk-mc-preview-panel-label">Board-ready export</p>
              <div className="pp-ins-preview-export-card">
                <p className="pp-ins-preview-export-name">executive-kpis-2026-06.csv</p>
                <ul className="pp-ins-preview-export-meta">
                  <li>Total revenue · Dues · Events · Giving</li>
                  <li>Renewal rate · At-risk count</li>
                  <li>Audit log: export.insights · ADMIN</li>
                </ul>
                <p className="pp-ins-preview-export-note">
                  Same figures as the console—pulled when you export, not a stale cache.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="mk-mc-preview-foot">
          <p>MemberCore, Commerce, Events, and Giving feed one executive view.</p>
          <p className="mk-mc-preview-disclaimer">Illustrative sample · alpha preview</p>
        </footer>
      </div>
    </div>
  );
}
