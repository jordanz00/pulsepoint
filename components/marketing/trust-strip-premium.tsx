"use client";

import { SOCIAL_PROOF } from "@/lib/marketing-catalog";
import { LEADERSHIP_STATS } from "@/lib/marketing-home";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

export function TrustStripPremium() {
  return (
    <section className="mk-trust-strip pp-trust-strip-premium py-10">
      <div className="mk-container">
        <RevealOnView>
          <div className="pp-trust-strip-copy text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              {SOCIAL_PROOF.headline}
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--fg-muted)]">
              {SOCIAL_PROOF.sub}
            </p>
          </div>
        </RevealOnView>

        <ul className="pp-trust-strip-stats" aria-label="Association scale at a glance">
          {LEADERSHIP_STATS.slice(0, 4).map((stat, i) => (
            <RevealOnView key={stat.id} delayMs={40 + i * 35}>
              <li
                className="pp-trust-strip-stat mk-liquid-glass"
                style={moduleCssVars(stat.productId as ProductId)}
              >
                <p className="pp-trust-strip-stat-value">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="pp-trust-strip-stat-label">{stat.label}</p>
                <p className="pp-trust-strip-stat-impact">{stat.impact}</p>
              </li>
            </RevealOnView>
          ))}
        </ul>
      </div>
    </section>
  );
}
