"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WhyPulsePointCompareScrubber } from "@/components/marketing/why-pulsepoint-compare-scrubber";
import { WhyPulsePointModuleFilm } from "@/components/marketing/why-pulsepoint-module-film";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { WHAT_MAKES_IT_DIFFERENT } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import { FLAGSHIP_COMPARE_STORIES } from "@/lib/why-pulsepoint-flagship";

const STORY_ROTATE_MS = 9000;

export function VsLegacyPremiumSection() {
  const w = WHAT_MAKES_IT_DIFFERENT;
  const reduced = usePrefersReducedMotion();
  const [activeStory, setActiveStory] = useState(0);
  const [paused, setPaused] = useState(false);

  const pickStory = useCallback(
    (index: number) => setActiveStory(index % FLAGSHIP_COMPARE_STORIES.length),
    [],
  );

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setActiveStory((i) => (i + 1) % FLAGSHIP_COMPARE_STORIES.length);
    }, STORY_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  const story = FLAGSHIP_COMPARE_STORIES[activeStory]!;

  return (
    <section
      id="why-pulsepoint"
      className="pp-flagship mk-section scroll-mt-28"
      aria-labelledby="pp-flagship-title"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-flagship-aurora" aria-hidden />
      <div className="pp-flagship-grid" aria-hidden />

      <div className="mk-container pp-flagship-inner">
        <RevealOnView>
          <header className="pp-flagship-header">
            <p className="pp-flagship-eyebrow">{w.eyebrow}</p>
            <h2 id="pp-flagship-title" className="pp-flagship-title">
              <span className="pp-flagship-title-main">{w.headline}</span>
              <span className="pp-flagship-title-accent">{w.headlineAccent}</span>
            </h2>
            <p className="pp-flagship-lead">{w.lead}</p>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={60}>
          <div className="pp-flagship-metrics" aria-label="Platform at a glance">
            {w.headlineStats.map((stat) => (
              <article
                key={stat.id}
                className="pp-flagship-metric mk-liquid-glass"
                style={moduleCssVars(stat.productId as ProductId)}
              >
                <p className="pp-flagship-metric-value">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="pp-flagship-metric-label">{stat.label}</p>
                <p className="pp-flagship-metric-detail">{stat.detail}</p>
              </article>
            ))}
          </div>
        </RevealOnView>

        <RevealOnView delayMs={100}>
          <div className="pp-flagship-act">
            <p className="pp-flagship-act-label">Act I · The gap</p>
            <h3 className="pp-flagship-act-title">Drag between fragmented tools and one spine</h3>
          </div>
        </RevealOnView>

        <div onMouseEnter={() => setPaused(true)}>
          <WhyPulsePointCompareScrubber
            story={story}
            stories={FLAGSHIP_COMPARE_STORIES}
            activeIndex={activeStory}
            onSelectStory={pickStory}
          />
        </div>

        <RevealOnView delayMs={120}>
          <div className="pp-flagship-act">
            <p className="pp-flagship-act-label">Act II · The product</p>
            <h3 className="pp-flagship-act-title">Every module reads the same hospital record</h3>
            <p className="pp-flagship-act-lead">
              Select a module—or let it play—to see real UI patterns, not icon grids.
            </p>
          </div>
        </RevealOnView>

        <RevealOnView delayMs={140}>
          <WhyPulsePointModuleFilm />
        </RevealOnView>

        <RevealOnView delayMs={160}>
          <footer className="pp-flagship-footer">
            <p className="pp-flagship-closing">{w.closing}</p>
            <p className="pp-flagship-disclaimer">{w.disclaimer}</p>
            <div className="pp-flagship-cta-row">
              <Link href="/demo" className="pc-btn-primary !rounded-full px-8">
                Open interactive demo
              </Link>
              <a href="#features" className="pc-btn-secondary !rounded-full px-8">
                Explore all modules
              </a>
            </div>
          </footer>
        </RevealOnView>
      </div>
    </section>
  );
}
