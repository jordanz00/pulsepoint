import { HERO_COPY } from "@/lib/marketing-content";
import { MarketingCtas } from "@/components/marketing/marketing-ctas";

export function MarketingHero({
  userId,
  standalone = false,
}: {
  userId: string | null | undefined;
  standalone?: boolean;
}) {
  return (
    <section className="pc-section-hero px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="pc-eyebrow-light text-sm">{HERO_COPY.eyebrow}</p>
        <h1 className="pc-display mt-4 text-4xl font-semibold tracking-tight text-[var(--pc-text)] sm:text-5xl sm:leading-tight">
          {HERO_COPY.headline}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--pc-text-secondary)]">
          {HERO_COPY.lead}
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--pc-text-secondary)]">
          {HERO_COPY.bridge}
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
