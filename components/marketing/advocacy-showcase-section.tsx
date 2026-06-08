"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdvocacyMarketingPreview } from "@/components/marketing/advocacy-marketing-preview";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { ADVOCACY_MARKETING } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import type { AdvocacyPreviewFocus } from "@/lib/advocacy-marketing-preview";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

const ROTATE_MS = 5200;
const FOCUS_BY_OUTCOME: AdvocacyPreviewFocus[] = ["issues", "campaigns", "roster"];

export function AdvocacyShowcaseSection() {
  const m = ADVOCACY_MARKETING;
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

  const focus = FOCUS_BY_OUTCOME[active] ?? "issues";

  return (
    <section
      id="advocacy"
      className="pp-advocacy-showcase mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-advocacy-headline"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-advocacy-showcase-ambient" aria-hidden />
      <div className="mk-container pp-advocacy-showcase-inner">
        <RevealOnView>
          <header className="pp-advocacy-showcase-header">
            <div className="pp-advocacy-showcase-header-main">
              <span className="pp-advocacy-showcase-eyebrow">{m.eyebrow}</span>
              <h2 id="pp-advocacy-headline" className="pp-advocacy-showcase-headline">
                {m.headline}
              </h2>
              <p className="pp-advocacy-showcase-lead">{m.lead}</p>
            </div>
            <div className="pp-advocacy-showcase-stat" aria-label="Grassroots activity">
              <p className="pp-advocacy-showcase-stat-value">
                <AnimatedNumber value={m.statHighlight.value} />
              </p>
              <p className="pp-advocacy-showcase-stat-label">{m.statHighlight.label}</p>
              <p className="pp-advocacy-showcase-stat-context">{m.statHighlight.context}</p>
            </div>
          </header>
        </RevealOnView>

        <div className="pp-advocacy-showcase-stage" onMouseEnter={() => setPaused(true)}>
          <RevealOnView delayMs={60} className="pp-advocacy-showcase-preview-wrap">
            <AdvocacyMarketingPreview demoHref={m.demoHref} focus={focus} />
          </RevealOnView>

          <div className="pp-advocacy-showcase-copy">
            <div
              className="pp-advocacy-showcase-outcomes"
              role="tablist"
              aria-label="Advocacy capabilities"
            >
              {outcomes.map((outcome, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={outcome.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`pp-advocacy-outcome${isActive ? " pp-advocacy-outcome--active" : ""}`}
                    style={moduleCssVars(outcome.productId as ProductId)}
                    onMouseEnter={() => pick(i)}
                    onFocus={() => pick(i)}
                    onClick={() => pick(i)}
                  >
                    <div className="pp-advocacy-outcome-icon">
                      <FeatureIcon
                        icon={outcome.icon}
                        productId={outcome.productId as ProductId}
                        size="md"
                      />
                    </div>
                    <div className="pp-advocacy-outcome-body">
                      <p className="pp-advocacy-outcome-title">{outcome.title}</p>
                      <p className="pp-advocacy-outcome-text">{outcome.body}</p>
                      {isActive ? (
                        <>
                          <p className="pp-advocacy-outcome-proof">{outcome.proof}</p>
                          <ul className="pp-advocacy-outcome-features" aria-label="Features">
                            {outcome.features.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <ul className="pp-advocacy-proof-strip" aria-label="Module status">
              {m.proofStrip.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className="pp-advocacy-showcase-cta-row">
              <Link href={m.demoHref} className="btn btn-primary pp-advocacy-showcase-cta">
                {m.demoLabel}
              </Link>
              <p className="pp-advocacy-showcase-disclaimer" role="note">
                {m.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
