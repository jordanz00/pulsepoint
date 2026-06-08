/**
 * Marketing section — why healthcare associations choose PulsePoint.
 * Renders WHY_ORGANIZATIONS_CHOOSE from lib/marketing-content.ts.
 */

import { WHY_ORGANIZATIONS_CHOOSE } from "@/lib/marketing-content";

export function WhyChooseSection() {
  const w = WHY_ORGANIZATIONS_CHOOSE;
  return (
    <section id="why-pulsepoint" className="border-t border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--pc-navy)]">
          {w.title}
        </h2>
        {w.paragraphs.map((p) => (
          <p key={p.slice(0, 48)} className="mt-4 leading-relaxed text-slate-600">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
