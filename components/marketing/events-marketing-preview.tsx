"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import {
  EVENTS_PREVIEW_KPIS,
  EVENTS_PREVIEW_PROGRAMS,
  EVENTS_PREVIEW_REVENUE_MIX,
} from "@/lib/events-marketing-preview";
import { moduleCssVars } from "@/lib/module-colors";
import { modGlassKpiProps, modMixSegmentProps } from "@/lib/marketing-module-glass";

export function EventsMarketingPreview({ demoHref = "/demo-healthcare/events" }: { demoHref?: string }) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [programFocus, setProgramFocus] = useState(0);

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
      className={`mk-ev-preview-shell mk-liquid-glass pp-glass-interactive${ready ? " mk-ev-preview-shell--ready" : ""}`}
      role="region"
      aria-label="Interactive EventCore preview"
    >
      <div className="mk-mc-preview-shine" aria-hidden />
      <div className="mk-preview-ambient" aria-hidden />
      <div className="mk-mc-preview-inner">
        <header className="mk-mc-preview-chrome">
          <div className="mk-mc-preview-chrome-left">
            <FeatureIcon icon="events" productId="events" />
            <div>
              <p className="mk-mc-preview-chrome-title">EventCore</p>
              <p className="mk-mc-preview-chrome-sub">
                <span className="mk-mc-preview-live-dot" aria-hidden />
                Programs & registration · sample workspace
              </p>
            </div>
          </div>
          <Link href={demoHref} className="btn-primary mk-mc-preview-cta mk-preview-cta-shine">
            Open demo
          </Link>
        </header>

        <div className="mk-mc-preview-kpis mk-mc-preview-kpis--executive" aria-label="Event metrics">
          {EVENTS_PREVIEW_KPIS.map((kpi, i) => {
            const glass = modGlassKpiProps(kpi.productId, programFocus === i);
            return (
              <button
                key={kpi.id}
                type="button"
                {...glass}
                className={`${glass.className} mk-preview-hit`}
                aria-pressed={programFocus === i}
                onClick={() => setProgramFocus(i)}
              >
                <span className="mk-mc-preview-kpi-label">{kpi.label}</span>
                <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
                  <AnimatedNumber
                    value={kpi.value}
                    prefix={"prefix" in kpi ? kpi.prefix : ""}
                    suffix={"suffix" in kpi ? kpi.suffix : ""}
                  />
                </span>
                <span className="mk-mc-preview-kpi-meta">{kpi.meta}</span>
              </button>
            );
          })}
        </div>

        <div className="mk-mc-preview-analytics-deck">
          <div
            className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
            style={moduleCssVars("events")}
          >
            <p className="mk-mc-preview-panel-label">Non-dues revenue mix</p>
            <div className="mk-mc-preview-mix-bar mk-mc-preview-mix-bar--hero" role="presentation">
              {EVENTS_PREVIEW_REVENUE_MIX.map((s) => {
                const seg = modMixSegmentProps(s.productId, s.pct);
                return <span key={s.label} {...seg} title={`${s.label} ${s.pct}%`} />;
              })}
            </div>
            <ul className="mk-mc-preview-mix-stats">
              {EVENTS_PREVIEW_REVENUE_MIX.map((s) => (
                <li key={s.label} style={moduleCssVars(s.productId)}>
                  <span className="mk-mc-preview-mix-pct">{s.pct}%</span>
                  <span className="mk-mc-preview-mix-name">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
            style={moduleCssVars("commerce")}
          >
            <p className="mk-mc-preview-panel-label">EasyDNN export</p>
            <ol className="mk-ev-preview-dnn-steps">
              <li>Save DNN site URL in Integrations</li>
              <li>Generate HTML on the event Website tab</li>
              <li>Paste into EasyDNN—CTA links to registration</li>
            </ol>
          </div>
        </div>

        <section className="mk-mc-preview-directory" aria-label="Upcoming programs">
          <p className="mk-mc-preview-panel-label">Upcoming programs</p>
          <ul className="mk-adv-preview-campaigns">
            {EVENTS_PREVIEW_PROGRAMS.map((p, i) => {
              const pct = Math.round((p.registered / p.capacity) * 100);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`mk-ev-preview-program mk-preview-hit w-full text-left${programFocus === i ? " is-active" : ""}`}
                    style={programFocus === i ? moduleCssVars(p.productId) : undefined}
                    aria-pressed={programFocus === i}
                    onClick={() => setProgramFocus(i)}
                  >
                    <div className="mk-adv-preview-campaign-head">
                      <span className="mk-adv-preview-campaign-name">{p.name}</span>
                      <span className="mk-adv-preview-campaign-count">
                        {p.registered}/{p.capacity}
                      </span>
                    </div>
                    <div className="mk-mc-preview-facility-track">
                      <span className="mk-mc-preview-facility-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="mk-ev-preview-program-meta">
                      {p.date} · ${p.revenueK}K revenue
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="mk-mc-preview-foot">
          <p>
            <strong className="mk-mc-preview-foot-stat">
              <AnimatedNumber value={1847} />
            </strong>{" "}
            registrations · statewide programs
          </p>
          <p className="mk-mc-preview-disclaimer">Illustrative sample data · not your association</p>
        </footer>
      </div>
    </div>
  );
}
