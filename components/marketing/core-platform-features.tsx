import type { CatalogStatus } from "@/lib/marketing-catalog";
import {
  CORE_PLATFORM_FEATURES,
  PLATFORM_INTRO,
} from "@/lib/marketing-content";

export function CorePlatformFeaturesSection() {
  return (
    <section id="features" className="py-16">
      <h2 className="pc-display text-center text-2xl font-semibold text-[var(--pc-text)]">
        {PLATFORM_INTRO.title}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--pc-text-secondary)]">
        {PLATFORM_INTRO.subtitle}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CORE_PLATFORM_FEATURES.map((feature) => (
          <article key={feature.id} className="pc-card flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-[var(--pc-text)]">
                {feature.title}
              </h3>
              <StatusBadge status={feature.status} />
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--pc-text-secondary)]">
              {feature.description}
            </p>
            {feature.pulseModule && (
              <p className="mt-3 text-xs font-medium text-[var(--pc-brand)]">
                {feature.pulseModule}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: CatalogStatus }) {
  const label =
    status === "available" ? "Live" : status === "alpha" ? "Preview" : "Soon";
  const cls =
    status === "available"
      ? "bg-[var(--pc-accent-soft)] text-[var(--pc-brand)]"
      : status === "alpha"
        ? "bg-amber-50 text-amber-900"
        : "bg-[var(--pc-bg-elevated)] text-[var(--pc-text-tertiary)]";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}
