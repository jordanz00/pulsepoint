import { AMS_FEATURE_CATALOG } from "@/lib/marketing-catalog";
import { StatusPill } from "@/components/marketing/status-pill";

/** @deprecated Homepage uses FeatureMatrixSection — kept for other pages */
export function FeaturesCatalogSection() {
  return (
    <section className="border-t border-slate-200 py-16">
      <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--pc-navy)]">
        Features
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">
        Familiar AMS categories—modular delivery. Live and alpha modules are in the demo.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AMS_FEATURE_CATALOG.map((feature) => (
          <article key={feature.id} className="pc-card flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <StatusPill status={feature.status} />
            </div>
            <p className="mt-2 flex-1 text-sm text-slate-600">{feature.description}</p>
            {feature.pulseModule ? (
              <p className="mt-3 text-xs font-medium text-slate-500">{feature.pulseModule}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
