"use client";

import { useState } from "react";
import Link from "next/link";
import { MARKETING_SECTIONS } from "@/lib/marketing-home";
import { PULSE_PRODUCTS } from "@/lib/products";
import { StatusPill } from "@/components/marketing/status-pill";
import { MarketingSectionHeader } from "@/components/marketing/marketing-section-header";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import type { CatalogStatus } from "@/lib/marketing-catalog";

function catalogStatus(productStatus: string): CatalogStatus {
  if (productStatus === "available") return "available";
  if (productStatus === "alpha") return "alpha";
  return "roadmap";
}

export function ModuleShowcase({ standalone }: { standalone?: boolean }) {
  const [active, setActive] = useState(PULSE_PRODUCTS[0]!.id);
  const product = PULSE_PRODUCTS.find((p) => p.id === active) ?? PULSE_PRODUCTS[0]!;

  const s = MARKETING_SECTIONS.platform;
  return (
    <section id="platform" className="mk-section mk-section--band text-[var(--fg-default)]">
      <div className="mk-container">
        <MarketingSectionHeader eyebrow={s.eyebrow} title={s.title} lead={s.lead} />

        <RevealOnView>
          <div className="mk-section-body flex flex-wrap justify-center gap-2">
            {PULSE_PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                className={`mk-module-pill min-h-9 rounded-full border px-4 py-2 text-[13px] font-medium tracking-[-0.005em] transition-all duration-[var(--motion-fast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)] ${
                  active === p.id ? "mk-module-pill--active" : ""
                }`}
              >
                {p.shortName}
              </button>
            ))}
          </div>
        </RevealOnView>

        <RevealOnView delayMs={80}>
          <div className="mk-bento-card mk-module-showcase-card pp-mkt-light-surface mx-auto mt-6 max-w-3xl p-8 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--pill-active-text)]">
                  PulsePoint module
                </p>
                <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.022em]">
                  {product.name}
                </h3>
              </div>
              <StatusPill status={catalogStatus(product.status)} />
            </div>
            <p className="mt-4 text-[17px] leading-[1.55] text-[var(--pc-text-secondary)]">
              {product.tagline}
            </p>
            {standalone ? (
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/demo" className="pc-btn-primary text-sm">
                  Open interactive demo
                </Link>
                <Link href="/demo-healthcare/suite" className="pc-btn-secondary text-sm">
                  Full suite explorer
                </Link>
              </div>
            ) : (
              <p className="mt-7 text-sm text-[var(--pc-text-tertiary)]">
                Enable demo mode locally to click through every module.
              </p>
            )}
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
