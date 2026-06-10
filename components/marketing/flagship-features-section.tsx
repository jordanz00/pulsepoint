"use client";

import Link from "next/link";
import { useState } from "react";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { FLAGSHIP_MARKETING } from "@/lib/flagship-marketing";

function statusClass(status: string): string {
  if (status === "live") return "mk-flagship-features__badge--live";
  if (status === "alpha") return "mk-flagship-features__badge--alpha";
  return "mk-flagship-features__badge--preview";
}

export function FlagshipFeaturesSection({ id = "flagship-features" }: { id?: string }) {
  const [activeId, setActiveId] = useState(FLAGSHIP_MARKETING.features[0]!.id);
  const active =
    FLAGSHIP_MARKETING.features.find((f) => f.id === activeId) ??
    FLAGSHIP_MARKETING.features[0]!;

  return (
    <section id={id} className="mk-flagship-features mk-section scroll-mt-28" aria-labelledby="mk-flagship-features-title">
      <div className="mk-container">
        <RevealOnView>
          <header className="mk-flagship-features__header">
            <p className="mk-eyebrow">{FLAGSHIP_MARKETING.eyebrow}</p>
            <h2 id="mk-flagship-features-title" className="mk-section-title">
              {FLAGSHIP_MARKETING.headline}
            </h2>
            <p className="mk-section-lead">{FLAGSHIP_MARKETING.lead}</p>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={40}>
          <div className="mk-flagship-features__explorer">
            <div
              className="mk-flagship-features__tabs"
              role="tablist"
              aria-label="Flagship capabilities"
            >
              {FLAGSHIP_MARKETING.features.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={f.id === activeId}
                  aria-controls={`mk-flagship-panel-${f.id}`}
                  id={`mk-flagship-tab-${f.id}`}
                  className={`mk-flagship-features__tab${f.id === activeId ? " mk-flagship-features__tab--active" : ""}`}
                  onClick={() => setActiveId(f.id)}
                >
                  <span className={`mk-flagship-features__badge ${statusClass(f.status)}`}>
                    {f.statusLabel}
                  </span>
                  <span className="mk-flagship-features__tab-title">{f.title}</span>
                </button>
              ))}
            </div>

            <div
              id={`mk-flagship-panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`mk-flagship-tab-${active.id}`}
              className="mk-flagship-features__panel"
            >
              <div className="mk-flagship-features__panel-head">
                <h3 className="mk-flagship-features__panel-title">{active.title}</h3>
                <span className={`mk-flagship-features__badge ${statusClass(active.status)}`}>
                  {active.statusLabel}
                </span>
              </div>
              <p className="mk-flagship-features__panel-hook">{active.hook}</p>
              <ul className="mk-flagship-features__bullets">
                {active.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link href={active.demoHref} className="mk-btn mk-btn-primary">
                {FLAGSHIP_MARKETING.demoCta}
              </Link>
            </div>
          </div>
        </RevealOnView>

        <RevealOnView delayMs={80}>
          <p className="mk-flagship-features__footer">
            <Link href={FLAGSHIP_MARKETING.demoHref} className="mk-link">
              Open full flagship hub in demo →
            </Link>
          </p>
        </RevealOnView>
      </div>
    </section>
  );
}
