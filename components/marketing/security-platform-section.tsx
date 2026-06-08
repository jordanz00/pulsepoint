"use client";

import { SecurityMarketingPreview } from "@/components/marketing/security-marketing-preview";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { SECURITY_MARKETING } from "@/lib/marketing-home";

/** Trust & security — one centered interactive briefing card. */
export function SecurityPlatformSection() {
  const m = SECURITY_MARKETING;

  return (
    <section
      id="security"
      className="pp-sec-showcase mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-sec-headline"
    >
      <div className="pp-sec-showcase-ambient" aria-hidden />
      <div className="mk-container pp-sec-showcase-inner">
        <RevealOnView>
          <header className="pp-sec-showcase-header">
            <span className="pp-sec-showcase-eyebrow">{m.eyebrow}</span>
            <h2 id="pp-sec-headline" className="pp-sec-showcase-headline">
              {m.headline}
            </h2>
            <p className="pp-sec-showcase-lead">{m.lead}</p>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={80} className="pp-sec-showcase-preview-wrap">
          <SecurityMarketingPreview />
        </RevealOnView>

        <RevealOnView delayMs={120}>
          <div className="pp-sec-showcase-foot">
            <p className="pp-sec-showcase-footnote" role="note">
              {m.footnote}
            </p>
            <p className="pp-sec-showcase-disclaimer">{m.disclaimer}</p>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
