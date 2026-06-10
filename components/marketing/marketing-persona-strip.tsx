"use client";

import Link from "next/link";
import { MARKETING_PERSONAS } from "@/lib/marketing-catalog";
import { RevealOnView } from "@/components/motion/reveal-on-view";

const PERSONA_STYLE: Record<string, string> = {
  members: "pp-persona-card--members",
  leaders: "pp-persona-card--leaders",
  staff: "pp-persona-card--staff",
};

export function MarketingPersonaStrip() {
  return (
    <section id="personas" className="pp-persona-strip mk-section-tight scroll-mt-24">
      <div className="mk-container">
        <RevealOnView>
          <header className="pp-persona-strip-head">
            <p className="mk-section-eyebrow">Built for your team</p>
            <h2 className="pp-persona-strip-title">Members, leaders, and staff—one platform</h2>
          </header>
        </RevealOnView>

        <div className="pp-persona-strip-grid">
          {MARKETING_PERSONAS.map((persona, i) => (
            <RevealOnView key={persona.id} delayMs={i * 60}>
              <article
                className={`pp-persona-card mk-liquid-glass ${PERSONA_STYLE[persona.id] ?? ""}`}
              >
                <p className="pp-persona-card-eyebrow">{persona.productModule}</p>
                <h3 className="pp-persona-card-title">{persona.title}</h3>
                <p className="pp-persona-card-body">{persona.description}</p>
                <Link href="/demo" className="pp-persona-card-link">
                  {persona.cta} →
                </Link>
              </article>
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}
