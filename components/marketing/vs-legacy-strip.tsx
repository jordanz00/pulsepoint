import { VS_LEGACY_COPY } from "@/lib/marketing-content";

export function VsLegacyStrip() {
  const v = VS_LEGACY_COPY;
  return (
    <section className="border-y border-[var(--pc-border)] bg-white py-14">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="pc-display text-2xl font-semibold text-[var(--pc-text)]">{v.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[var(--pc-text-secondary)]">
          {v.lead}
        </p>
        <dl className="mx-auto mt-10 grid max-w-3xl gap-6 text-left sm:grid-cols-3">
          {v.pillars.map((pillar) => (
            <div key={pillar.title} className="pc-card">
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--pc-brand)]">
                {pillar.title}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[var(--pc-text-secondary)]">
                {pillar.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
