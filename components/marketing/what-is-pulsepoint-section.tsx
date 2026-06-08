"use client";

import Link from "next/link";
import { WHAT_IS_PULSEPOINT } from "@/lib/marketing-home";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

/** Compact connector band — deep dive lives in #why-pulsepoint. */
export function WhatIsPulsePointSection() {
  const w = WHAT_IS_PULSEPOINT;

  return (
    <section id="what-is" className="mk-section mk-section--band mk-what-is-section text-[var(--fg-default)]">
      <div className="mk-container">
        <RevealOnView>
          <header className="pp-what-is-compact-head">
            <p className="mk-section-eyebrow">{w.eyebrow}</p>
            <h2 className="pp-what-is-compact-title">{w.headline}</h2>
            <p className="pp-what-is-compact-lead">{w.lead}</p>
            <a href="#why-pulsepoint" className="pc-link text-sm font-semibold">
              See why PulsePoint is different →
            </a>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={80}>
          <aside className="mk-what-is-spine-map mk-liquid-glass" aria-label="How modules connect">
            <header className="mk-what-is-spine-map-header">
              <h3 className="mk-what-is-spine-map-title">One spine. Every program.</h3>
              <p className="mk-what-is-spine-map-lead">
                MemberCore is the hub—events, advocacy, revenue, and outreach read the same hospital
                record.
              </p>
            </header>

            <div className="mk-what-is-spine-map-layout">
              <div className="mk-what-is-spine-map-hub" style={moduleCssVars("members")}>
                <FeatureIcon icon="members" productId="members" size="lg" />
                <p className="mk-what-is-spine-map-hub-name">MemberCore</p>
                <p className="mk-what-is-spine-map-hub-meta">One record · every module</p>
              </div>

              <ul className="mk-what-is-spine-map-modules">
                {w.spineModules.map((mod) => (
                  <li
                    key={mod.name}
                    className="mk-what-is-spine-map-module"
                    style={moduleCssVars(mod.productId as ProductId)}
                  >
                    <FeatureIcon icon={mod.icon} productId={mod.productId as ProductId} size="sm" />
                    <div className="mk-what-is-spine-map-module-copy">
                      <span className="mk-what-is-spine-map-module-name">{mod.name}</span>
                      <span className="mk-what-is-spine-map-module-tag">{mod.tag}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mk-what-is-spine-map-cta">
              <Link href="/demo-healthcare" className="pc-btn-primary !rounded-full">
                Open interactive demo
              </Link>
              <p className="mk-what-is-spine-map-note">Sample data · no login required</p>
            </div>
          </aside>
        </RevealOnView>
      </div>
    </section>
  );
}
