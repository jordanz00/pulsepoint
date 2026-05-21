import { AMS_FEATURE_CATALOG } from "@/lib/marketing-catalog";

export function FeaturesCatalogSection() {
  return (
    <section className="border-t border-slate-200 py-16">
      <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--pc-navy)]">
        Features
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">
        Familiar AMS categories—modular delivery. Available modules ship today; others
        are on the PulsePoint roadmap.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AMS_FEATURE_CATALOG.map((feature) => (
          <article
            key={feature.id}
            className="pc-card flex flex-col"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  feature.status === "available"
                    ? "bg-sky-100 text-sky-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {feature.status === "available" ? "Live" : "Roadmap"}
              </span>
            </div>
            <p className="mt-2 flex-1 text-sm text-slate-600">
              {feature.description}
            </p>
            {feature.pulseModule && (
              <p className="mt-3 text-xs font-medium text-slate-500">
                {feature.pulseModule}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
