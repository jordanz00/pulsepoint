"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatedBarList } from "@/components/charts/animated-bar-list";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { ASSOCIATION_SPINE_MARKETING } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

const SIGNAL_COLORS: Record<string, string> = {
  active: "var(--icon-members)",
  moderate: "var(--icon-crm)",
  attention: "var(--icon-advocacy)",
  dues: "var(--icon-commerce)",
  programs: "var(--icon-events)",
  giving: "var(--icon-giving)",
  email: "var(--icon-engage)",
  forms: "var(--icon-crm)",
  pipeline: "var(--icon-deals)",
};

const ROTATE_MS = 5200;

export function AmsCrmBand() {
  const m = ASSOCIATION_SPINE_MARKETING;
  const lanes = m.lanes;
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const pick = useCallback((index: number) => {
    setActive(index % lanes.length);
  }, [lanes.length]);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % lanes.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [lanes.length, paused, reduced]);

  const lane = lanes[active]!;
  const barRows = lane.signals.map((s) => ({
    id: s.id,
    label: s.label,
    pct: s.pct,
    color: SIGNAL_COLORS[s.id],
  }));

  return (
    <section
      id="ams-crm"
      className="pp-association-spine mk-section text-[var(--fg-default)]"
      aria-labelledby="pp-association-spine-headline"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-association-spine-ambient" aria-hidden />
      <div className="mk-container pp-association-spine-inner">
        <RevealOnView>
          <header className="pp-association-spine-header">
            <span className="pp-association-spine-eyebrow">{m.eyebrow}</span>
            <h2 id="pp-association-spine-headline" className="pp-association-spine-headline">
              {m.headline}
            </h2>
            <p className="pp-association-spine-lead">{m.lead}</p>
          </header>
        </RevealOnView>

        <div
          className="pp-association-spine-stage"
          onMouseEnter={() => setPaused(true)}
        >
          <div
            className="pp-association-spine-lanes"
            role="tablist"
            aria-label="Platform capabilities"
          >
            {lanes.map((item, i) => {
              const isActive = i === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`pp-association-spine-lane${isActive ? " pp-association-spine-lane--active" : ""}`}
                  style={moduleCssVars(item.productId as ProductId)}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                >
                  <div className="pp-association-spine-lane-icon">
                    <FeatureIcon
                      icon={item.icon}
                      productId={item.productId as ProductId}
                      size="md"
                    />
                  </div>
                  <div className="pp-association-spine-lane-body">
                    <p className="pp-association-spine-lane-title">{item.title}</p>
                    <p className="pp-association-spine-lane-summary">{item.summary}</p>
                    <ul className="pp-association-spine-modules" aria-label="Modules">
                      {item.modules.map((mod) => (
                        <li key={mod}>{mod}</li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          <RevealOnView delayMs={80} className="pp-association-spine-preview-wrap">
            <div
              className="pp-association-spine-preview mk-liquid-glass"
              style={moduleCssVars(lane.productId as ProductId)}
              role="tabpanel"
              aria-label={lane.title}
            >
              <div className="pp-association-spine-flow" aria-label="Data flow">
                <span className="pp-association-spine-node pp-association-spine-node--start">
                  {m.spineStart}
                </span>
                <span className="pp-association-spine-arrow" aria-hidden>
                  →
                </span>
                <span className="pp-association-spine-node pp-association-spine-node--mid">
                  {lane.spineStep}
                </span>
                <span className="pp-association-spine-arrow" aria-hidden>
                  →
                </span>
                <span className="pp-association-spine-node pp-association-spine-node--end">
                  {m.spineEnd}
                </span>
              </div>

              <div className="pp-association-spine-metrics">
                <h3 className="pp-association-spine-preview-label">{lane.title}</h3>
                <p className="pp-association-spine-metrics-hint">
                  {lane.id === "revenue"
                    ? "How mission funding typically splits across dues, programs, and giving."
                    : "Illustrative signals from a demo association workspace."}
                </p>
                {lane.id === "revenue" ? (
                  <div
                    className="pp-association-spine-stack"
                    aria-label="Revenue mix overview"
                    role="img"
                  >
                    {barRows.map((r) => (
                      <span
                        key={r.id}
                        style={{
                          flexGrow: r.pct,
                          background: r.color ?? "var(--brand-primary)",
                        }}
                        title={`${r.label} ${r.pct}%`}
                      />
                    ))}
                  </div>
                ) : null}
                <AnimatedBarList rows={barRows} />
              </div>

              <footer className="pp-association-spine-preview-foot">
                <p className="pp-association-spine-disclaimer">{m.disclaimer}</p>
                <Link href={m.demoHref} className="btn btn-primary pp-association-spine-cta">
                  {m.demoLabel}
                </Link>
              </footer>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
