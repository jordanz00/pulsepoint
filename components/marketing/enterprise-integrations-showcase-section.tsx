"use client";

import Link from "next/link";
import { EnterpriseIntegrationsPreview } from "@/components/marketing/enterprise-integrations-preview";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { ENTERPRISE_INTEGRATIONS_MARKETING } from "@/lib/marketing-home";

/** IT & web teams — one centered go-live handoff card. */
export function EnterpriseIntegrationsShowcaseSection() {
  const m = ENTERPRISE_INTEGRATIONS_MARKETING;

  return (
    <section
      id="enterprise-stack"
      className="pp-enterprise-integrations mk-section mk-section--band text-[var(--fg-default)]"
      aria-labelledby="pp-ei-headline"
    >
      <div className="pp-ei-ambient" aria-hidden />
      <div className="mk-container pp-ei-inner">
        <RevealOnView>
          <header className="pp-ei-header">
            <span className="pp-ei-eyebrow">{m.eyebrow}</span>
            <h2 id="pp-ei-headline" className="pp-ei-headline">
              {m.headline}
            </h2>
            <p className="pp-ei-lead">{m.lead}</p>
          </header>
        </RevealOnView>

        <RevealOnView delayMs={80} className="pp-ei-preview-wrap">
          <EnterpriseIntegrationsPreview demoHref={m.demoHref} />
        </RevealOnView>

        <RevealOnView delayMs={120}>
          <div id="integrations" className="pp-ei-foot">
            <p className="pp-ei-footnote">{m.footnote}</p>
            <Link href={m.demoHref} className="btn btn-primary pp-ei-cta">
              {m.demoLabel}
            </Link>
            <p className="pp-ei-disclaimer" role="note">
              {m.disclaimer}
            </p>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
