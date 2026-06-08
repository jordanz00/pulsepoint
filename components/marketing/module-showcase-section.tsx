import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingSectionHeader } from "@/components/marketing/marketing-section-header";
import { RevealOnView } from "@/components/motion/reveal-on-view";

export type ModuleShowcaseSectionProps = {
  id: string;
  eyebrow: string;
  headline: string;
  lead: string;
  capabilities: readonly string[];
  demoHref: string;
  demoLabel: string;
  preview: ReactNode;
  /** Put preview node first in DOM (same visual: copy left, preview right) */
  domPreviewFirst?: boolean;
  band?: boolean;
  disclaimer?: string;
};

/**
 * Shared module showcase — copy + capability checks + glass preview (Advocacy pattern).
 */
export function ModuleShowcaseSection({
  id,
  eyebrow,
  headline,
  lead,
  capabilities,
  demoHref,
  demoLabel,
  preview,
  domPreviewFirst = false,
  band = true,
  disclaimer,
}: ModuleShowcaseSectionProps) {
  const copyCol = (
    <div className="lg:col-span-2 lg:order-1">
      <MarketingSectionHeader
        align="left"
        className="!mb-6"
        eyebrow={eyebrow}
        title={headline}
        lead={lead}
      />
      <ul className="mk-module-showcase-caps space-y-2.5">
        {capabilities.map((cap, i) => (
          <RevealOnView key={cap} delayMs={i * 40}>
            <li className="mk-capability-item flex gap-3 text-sm">
              <span className="mk-capability-check mt-0.5 shrink-0" aria-hidden>
                ✓
              </span>
              <span className="font-medium text-[var(--readable-on-light-fg)]">{cap}</span>
            </li>
          </RevealOnView>
        ))}
      </ul>
      {disclaimer ? (
        <p className="mk-module-showcase-disclaimer" role="note">
          {disclaimer}
        </p>
      ) : null}
      <Link
        href={demoHref}
        className={`pc-btn-primary mk-module-showcase-cta inline-flex !rounded-full${disclaimer ? " mt-6" : " mt-8"}`}
      >
        {demoLabel}
      </Link>
    </div>
  );

  const previewCol = (
    <RevealOnView delayMs={80} className="min-w-0 lg:col-span-3 lg:order-2">
      {preview}
    </RevealOnView>
  );

  return (
    <section
      id={id}
      className={`mk-section mk-module-showcase text-[var(--fg-default)]${band ? " mk-section--band" : ""}`}
    >
      <div className="mk-container">
        <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-10">
          {domPreviewFirst ? (
            <>
              {previewCol}
              {copyCol}
            </>
          ) : (
            <>
              {copyCol}
              {previewCol}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
