import { ADVANCE_ASSOCIATION } from "@/lib/marketing-catalog";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";

export function AdvanceAssociationSection() {
  return (
    <section className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--pc-navy)]">
          {ADVANCE_ASSOCIATION.headline}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          {ADVANCE_ASSOCIATION.lead}
        </p>
        <p className="mt-3 text-slate-500">{ADVANCE_ASSOCIATION.sub}</p>
        <div className="mt-8 flex justify-center">
          <MarketingCtas />
        </div>
      </div>
    </section>
  );
}
