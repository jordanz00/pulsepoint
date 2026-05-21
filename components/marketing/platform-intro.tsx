import { HERO_COPY } from "@/lib/marketing-content";

/** Secondary intro block below hero — expands value proposition */
export function PlatformIntroSection() {
  return (
    <section className="border-b border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-lg leading-relaxed text-slate-700">{HERO_COPY.lead}</p>
        <p className="mt-4 text-base leading-relaxed text-slate-500">
          {HERO_COPY.bridge}
        </p>
      </div>
    </section>
  );
}
