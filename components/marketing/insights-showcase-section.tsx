"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { InsightsMarketingPreview } from "@/components/marketing/insights-marketing-preview";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { INSIGHTS_MARKETING } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

const ROTATE_MS = 5000;

export function InsightsShowcaseSection({ demoHref }: { demoHref: string }) {
  const m = INSIGHTS_MARKETING;
  const outcomes = m.outcomes;
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const pick = useCallback((index: number) => {
    setActive(index % outcomes.length);
  }, [outcomes.length]);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % outcomes.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [outcomes.length, paused, reduced]);

  const current = outcomes[active]!;

  return (
    <section
      id="analytics"
      className="pp-insights-showcase mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-insights-headline"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-insights-showcase-ambient" aria-hidden />
      <div className="mk-container pp-insights-showcase-inner">
        <RevealOnView>
          <header className="pp-insights-showcase-header">
            <span className="pp-insights-showcase-eyebrow">{m.eyebrow}</span>
            <h2 id="pp-insights-headline" className="pp-insights-showcase-headline">
              {m.headline}
            </h2>
            <p className="pp-insights-showcase-lead">{m.lead}</p>
          </header>
        </RevealOnView>

        <div
          className="pp-insights-showcase-stage"
          onMouseEnter={() => setPaused(true)}
        >
          <div className="pp-insights-showcase-copy">
            <div
              className="pp-insights-showcase-outcomes"
              role="tablist"
              aria-label="Insights outcomes"
            >
              {outcomes.map((outcome, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={outcome.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`pp-insights-outcome${isActive ? " pp-insights-outcome--active" : ""}`}
                    style={moduleCssVars(outcome.productId as ProductId)}
                    onMouseEnter={() => pick(i)}
                    onFocus={() => pick(i)}
                    onClick={() => pick(i)}
                  >
                    <div className="pp-insights-outcome-icon">
                      <FeatureIcon
                        icon={outcome.icon}
                        productId={outcome.productId as ProductId}
                        size="md"
                      />
                    </div>
                    <div className="pp-insights-outcome-body">
                      <p className="pp-insights-outcome-title">{outcome.title}</p>
                      <p className="pp-insights-outcome-text">{outcome.body}</p>
                      {isActive ? (
                        <p className="pp-insights-outcome-proof">{outcome.proof}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <ul className="pp-insights-proof-strip" aria-label="Platform proof points">
              {m.proofStrip.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className="pp-insights-showcase-cta-row">
              <Link href={demoHref} className="btn btn-primary pp-insights-showcase-cta">
                {m.demoLabel}
              </Link>
              <p className="pp-insights-showcase-disclaimer" role="note">
                {m.disclaimer}
              </p>
            </div>
          </div>

          <RevealOnView delayMs={80} className="pp-insights-showcase-preview-wrap">
            <InsightsMarketingPreview
              demoHref={demoHref}
              focus={current.id as "revenue" | "renewals" | "exports"}
            />
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
