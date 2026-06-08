"use client";

import Link from "next/link";
import { PacMarketingPreview } from "@/components/marketing/pac-marketing-preview";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { PAC_MARKETING } from "@/lib/marketing-home";

/** Hospital PAC — one centered interactive board briefing (no duplicate KPI bands). */
export function PacShowcaseSection() {
  const m = PAC_MARKETING;

  return (
    <section
      id="pac"
      className="pp-pac-showcase mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-pac-headline"
    >
      <div className="pp-pac-showcase-ambient" aria-hidden />
      <div className="mk-container pp-pac-showcase-inner">
        <RevealOnView>
          <header className="pp-pac-showcase-header">
            <span className="pp-pac-showcase-eyebrow">{m.eyebrow}</span>
            <h2 id="pp-pac-headline" className="pp-pac-showcase-headline">
              {m.headline}
            </h2>
            <p className="pp-pac-showcase-lead">{m.lead}</p>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={80} className="pp-pac-showcase-preview-wrap">
          <PacMarketingPreview demoHref={m.demoHref} />
        </RevealOnView>

        <RevealOnView delayMs={120}>
          <div className="pp-pac-showcase-foot">
            <Link href={m.demoHref} className="btn btn-primary pp-pac-showcase-cta">
              {m.demoLabel}
            </Link>
            <p className="pp-pac-showcase-disclaimer" role="note">
              {m.disclaimer}
            </p>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
