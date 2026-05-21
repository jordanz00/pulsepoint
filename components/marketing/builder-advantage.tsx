import { BUILDER_ADVANTAGE } from "@/lib/brand";

export function BuilderAdvantageSection() {
  return (
    <section className="pc-section-navy rounded-2xl px-8 py-12 sm:px-12">
      <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
        Your strongest advantage
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        {BUILDER_ADVANTAGE.headline}
      </h2>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
        {BUILDER_ADVANTAGE.body}
      </p>
      <p className="mt-6 max-w-3xl border-l-2 border-sky-500/60 pl-4 text-slate-200 italic">
        {BUILDER_ADVANTAGE.closer}
      </p>
    </section>
  );
}
