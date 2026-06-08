"use client";

import { LEADERSHIP_PROMISE, LEADERSHIP_STATS } from "@/lib/marketing-home";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { moduleCssVars } from "@/lib/module-colors";

export function LeadershipBand() {
  return (
    <section className="mk-leadership-band" aria-label="Executive metrics">
      <div className="mk-container">
        <p className="mk-section-eyebrow mk-leadership-eyebrow">{LEADERSHIP_PROMISE.eyebrow}</p>
        <ul className="mk-leadership-stat-grid">
          {LEADERSHIP_STATS.map((stat) => (
            <li key={stat.id}>
              <article
                className="mk-stat-glass-card mk-liquid-glass"
                style={moduleCssVars(stat.productId)}
              >
                <div className={`mk-stat-glass-value mk-stat-glass-value--${stat.id}`}>
                  <AnimatedNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <span className="mk-stat-glass-label">{stat.label}</span>
                <span className="mk-stat-glass-meta">{stat.impact}</span>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
