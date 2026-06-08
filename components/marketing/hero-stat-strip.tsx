"use client";

import { useState } from "react";
import { LEADERSHIP_STATS } from "@/lib/marketing-home";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { moduleCssVars } from "@/lib/module-colors";

/** Executive KPI strip — number + label; hover reveals the "so what". */
export function HeroStatStrip() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <ul className="mk-hero-stat-strip" aria-label="Executive metrics">
      {LEADERSHIP_STATS.map((stat) => {
        const isActive = active === stat.id;
        return (
          <li key={stat.id}>
            <article
              className={`mk-hero-stat-card mk-liquid-glass${isActive ? " is-active" : ""}`}
              style={moduleCssVars(stat.productId)}
              onMouseEnter={() => setActive(stat.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(stat.id)}
              onBlur={() => setActive(null)}
              tabIndex={0}
            >
              <div className={`mk-hero-stat-value mk-hero-stat-value--${stat.id}`}>
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <span className="mk-hero-stat-label">{stat.label}</span>
              <p className={`mk-hero-stat-impact${isActive ? " is-visible" : ""}`}>{stat.impact}</p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
