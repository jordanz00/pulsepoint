"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ENTERPRISE_HEALTHCARE } from "@/lib/marketing-home";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

const ROTATE_MS = 4200;

export function EnterpriseHealthcareSection() {
  const c = ENTERPRISE_HEALTHCARE;
  const modules = c.modules;
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const pick = useCallback((index: number) => {
    setActive(index % modules.length);
  }, [modules.length]);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % modules.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [modules.length, paused, reduced]);

  const mod = modules[active]!;

  return (
    <section
      id="healthcare"
      className="pp-hc-future mk-section-tight"
      aria-labelledby="pp-hc-future-headline"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-hc-future-ambient" aria-hidden />
      <div className="pp-hc-future-grid" aria-hidden />

      <div className="mk-container pp-hc-future-inner">
        <header className="pp-hc-future-header pp-motion-header">
          <span className="pp-hc-future-badge">{c.badge}</span>
          <h2 id="pp-hc-future-headline" className="pp-hc-future-headline">
            {c.headline}
          </h2>
          <p className="pp-hc-future-tagline">{c.tagline}</p>
        </header>

        <div
          className="pp-hc-future-stage glass pp-motion-card"
          onMouseEnter={() => setPaused(true)}
        >
          <div
            className="pp-hc-future-hub pp-motion-float"
            key={mod.id}
            style={moduleCssVars(mod.tone as ProductId)}
          >
            <div className="pp-hc-future-hub-icon">
              <FeatureIcon icon={mod.icon} productId={mod.tone as ProductId} size="xl" />
            </div>
            <p className="pp-hc-future-hub-stat" aria-live="polite">
              <AnimatedNumber
                key={`${mod.id}-stat`}
                value={mod.statValue}
                prefix={mod.statPrefix}
                suffix={mod.statSuffix}
              />
            </p>
            <p className="pp-hc-future-hub-label">{mod.statLabel}</p>
            <p className="pp-hc-future-hub-name">{mod.name}</p>
          </div>

          <div className="pp-hc-future-tiles" role="tablist" aria-label="PulsePoint modules">
            {modules.map((m, i) => {
              const isActive = i === active;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`pp-hc-future-tile pp-motion-tile${isActive ? " is-active" : ""}`}
                  style={{
                    ...moduleCssVars(m.tone as ProductId),
                    animationDelay: `${i * 70}ms`,
                  }}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                >
                  <FeatureIcon icon={m.icon} productId={m.tone as ProductId} size="md" />
                  <span className="pp-hc-future-tile-copy">
                    <span className="pp-hc-future-tile-name">{m.name}</span>
                    <span className="pp-hc-future-tile-tag">{m.tag}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pp-hc-future-cta">
          <Link href={c.ctaHref} className="btn btn-primary pp-hc-future-cta-btn">
            {c.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
