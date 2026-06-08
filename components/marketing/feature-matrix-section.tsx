"use client";

import { useState } from "react";
import type { FeatureMatrixIcon } from "@/lib/marketing-home";
import { FEATURE_MATRIX, MARKETING_SECTIONS } from "@/lib/marketing-home";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { StatusPill } from "@/components/marketing/status-pill";
import { SuiteModuleViz } from "@/components/marketing/suite-module-viz";
import { MarketingSectionHeader } from "@/components/marketing/marketing-section-header";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

const ICON_TO_PRODUCT: Partial<Record<FeatureMatrixIcon, ProductId>> = {
  members: "members",
  events: "events",
  work: "work",
  education: "learn",
  fundraising: "giving",
  commerce: "commerce",
  communications: "engage",
  insights: "insights",
  advocacy: "advocacy",
  crm: "crm",
  deals: "deals",
  advertising: "advertising",
};

export function FeatureMatrixSection() {
  const s = MARKETING_SECTIONS.features;
  const [hovered, setHovered] = useState<string | null>(FEATURE_MATRIX[0]?.id ?? null);
  const active = FEATURE_MATRIX.find((f) => f.id === hovered) ?? FEATURE_MATRIX[0]!;
  const productId = active ? ICON_TO_PRODUCT[active.icon] : undefined;

  return (
    <section id="capabilities" className="mk-section text-[var(--fg-default)]">
      <div className="mk-container">
        <MarketingSectionHeader eyebrow={s.eyebrow} title={s.title} lead={s.lead} />

        <div className="mk-feature-matrix-stage grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="mk-section-body grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_MATRIX.map((feature, i) => {
              const pid = ICON_TO_PRODUCT[feature.icon];
              const isActive = feature.id === hovered;
              return (
                <RevealOnView key={feature.id} delayMs={i * 40}>
                  <article
                    className={`mk-bento-card mk-feature-card mk-feature-card--interactive h-full${isActive ? " is-active" : ""}`}
                    style={pid ? moduleCssVars(pid) : undefined}
                    onMouseEnter={() => setHovered(feature.id)}
                    onFocus={() => setHovered(feature.id)}
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <FeatureIcon icon={feature.icon} productId={pid} size="lg" />
                      <StatusPill status={feature.status} />
                    </div>
                    <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.012em]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-[1.6] text-[var(--pc-text-secondary)]">
                      {feature.description}
                    </p>
                    <p className="mk-feature-card-module">{feature.module}</p>
                  </article>
                </RevealOnView>
              );
            })}
          </div>

          <RevealOnView delayMs={120}>
            <div
              className="mk-feature-matrix-spotlight mk-liquid-glass sticky top-24"
              style={productId ? moduleCssVars(productId) : undefined}
            >
              <p className="mk-feature-matrix-spotlight-eyebrow">{active.module}</p>
              <h3 className="mk-feature-matrix-spotlight-title">{active.title}</h3>
              <p className="mk-feature-matrix-spotlight-body">{active.description}</p>
              {productId ? (
                <div className="mk-feature-matrix-viz mt-4">
                  <SuiteModuleViz productId={productId} />
                </div>
              ) : null}
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
