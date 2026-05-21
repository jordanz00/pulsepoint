import { PULSE_COMMERCE_SPOTLIGHT } from "@/lib/marketing-content";
import { CapabilityList } from "@/components/marketing/capability-list";

export function CommerceSpotlightSection() {
  const s = PULSE_COMMERCE_SPOTLIGHT;

  return (
    <section id="pulsepoint-commerce" className="border-t border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          {s.category}{" "}
          <span className="text-slate-400">({s.productName})</span>
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--pc-navy)]">
          {s.productName}
        </h2>
        {s.paragraphs.map((p) => (
          <p key={p.slice(0, 48)} className="mt-4 leading-relaxed text-slate-600">
            {p}
          </p>
        ))}
        <p className="mt-3 text-sm text-slate-500">{s.roadmapNote}</p>
        <CapabilityList title={s.orgTitle} items={s.orgItems} />
        <p className="mt-8 text-slate-600 leading-relaxed">{s.closing}</p>
      </div>
    </section>
  );
}
