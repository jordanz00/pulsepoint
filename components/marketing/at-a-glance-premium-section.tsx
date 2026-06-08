"use client";

import { GlanceMarketingPreview } from "@/components/marketing/glance-marketing-preview";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { GLANCE_MARKETING } from "@/lib/marketing-home";

/** PulsePoint at a Glance — interactive platform snapshot before FAQ. */
export function AtAGlancePremiumSection() {
  const m = GLANCE_MARKETING;

  return (
    <section
      id="at-a-glance"
      className="pp-glance-showcase mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-glance-headline"
    >
      <div className="pp-glance-showcase-ambient" aria-hidden />
      <div className="mk-container pp-glance-showcase-inner">
        <RevealOnView>
          <header className="pp-glance-showcase-header">
            <span className="pp-glance-showcase-eyebrow">{m.eyebrow}</span>
            <h2 id="pp-glance-headline" className="pp-glance-showcase-headline">
              {m.headline}
            </h2>
            <p className="pp-glance-showcase-lead">{m.lead}</p>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={80} className="pp-glance-showcase-preview-wrap">
          <GlanceMarketingPreview />
        </RevealOnView>

        <RevealOnView delayMs={120}>
          <p className="pp-glance-showcase-footnote" role="note">
            {m.footnote}
          </p>
        </RevealOnView>
      </div>
    </section>
  );
}
