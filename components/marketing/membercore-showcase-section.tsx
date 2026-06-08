"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MemberCoreMarketingPreview } from "@/components/marketing/membercore-marketing-preview";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { MEMBERCORE_MARKETING } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import type { MembercorePreviewFocus } from "@/lib/membercore-marketing-preview";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

const ROTATE_MS = 5500;
const FOCUS_BY_OUTCOME: MembercorePreviewFocus[] = ["directory", "engagement", "roles"];

export function MemberCoreShowcaseSection() {
  const m = MEMBERCORE_MARKETING;
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

  const focus = FOCUS_BY_OUTCOME[active] ?? "directory";

  return (
    <section
      id="membercore"
      className="pp-membercore-showcase mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-membercore-headline"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-membercore-showcase-ambient" aria-hidden />
      <div className="mk-container pp-membercore-showcase-inner">
        <RevealOnView>
          <header className="pp-membercore-showcase-header">
            <div className="pp-membercore-showcase-header-main">
              <span className="pp-membercore-showcase-eyebrow">{m.eyebrow}</span>
              <h2 id="pp-membercore-headline" className="pp-membercore-showcase-headline">
                {m.headline}
              </h2>
              <p className="pp-membercore-showcase-lead">{m.lead}</p>
            </div>
            <div className="pp-membercore-showcase-stat" aria-label="Roster scale">
              <p className="pp-membercore-showcase-stat-value">
                <AnimatedNumber value={m.statHighlight.value} />
              </p>
              <p className="pp-membercore-showcase-stat-label">{m.statHighlight.label}</p>
              <p className="pp-membercore-showcase-stat-context">{m.statHighlight.context}</p>
            </div>
          </header>
        </RevealOnView>

        <div className="pp-membercore-showcase-stage" onMouseEnter={() => setPaused(true)}>
          <div className="pp-membercore-showcase-copy">
            <div
              className="pp-membercore-showcase-outcomes"
              role="tablist"
              aria-label="MemberCore capabilities"
            >
              {outcomes.map((outcome, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={outcome.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`pp-membercore-outcome${isActive ? " pp-membercore-outcome--active" : ""}`}
                    style={moduleCssVars(outcome.productId as ProductId)}
                    onMouseEnter={() => pick(i)}
                    onFocus={() => pick(i)}
                    onClick={() => pick(i)}
                  >
                    <div className="pp-membercore-outcome-icon">
                      <FeatureIcon
                        icon={outcome.icon}
                        productId={outcome.productId as ProductId}
                        size="md"
                      />
                    </div>
                    <div className="pp-membercore-outcome-body">
                      <p className="pp-membercore-outcome-title">{outcome.title}</p>
                      <p className="pp-membercore-outcome-text">{outcome.body}</p>
                      {isActive ? (
                        <>
                          <p className="pp-membercore-outcome-proof">{outcome.proof}</p>
                          <ul className="pp-membercore-outcome-features" aria-label="Features">
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

            <ul className="pp-membercore-proof-strip" aria-label="Platform proof">
              {m.proofStrip.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className="pp-membercore-showcase-cta-row">
              <Link href={m.demoHref} className="btn btn-primary pp-membercore-showcase-cta">
                {m.demoLabel}
              </Link>
              <p className="pp-membercore-showcase-disclaimer" role="note">
                {m.disclaimer}
              </p>
            </div>
          </div>

          <RevealOnView delayMs={80} className="pp-membercore-showcase-preview-wrap">
            <MemberCoreMarketingPreview demoHref={m.demoHref} focus={focus} />
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
