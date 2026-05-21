import { HERO_COPY } from "@/lib/marketing-content";
import { ORIGIN_STORY } from "@/lib/brand";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";

export function MarketingHero({
  userId,
  standalone = false,
}: {
  userId: string | null | undefined;
  standalone?: boolean;
}) {
  return (
    <section className="pc-section-navy px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="pc-eyebrow-warm text-sm font-bold uppercase">
          {HERO_COPY.eyebrow}
        </p>
        <h1 className="pc-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-tight">
          {HERO_COPY.headline}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-white/90">{HERO_COPY.lead}</p>
        <p className="mt-3 text-sm font-medium text-[var(--hap-light-blue)]">
          {ORIGIN_STORY}
        </p>
        {!userId && (
          <div className="mt-10 flex justify-center">
            <MarketingCtas standalone={standalone} />
          </div>
        )}
      </div>
    </section>
  );
}
