import {
  CORE_PLATFORM_FEATURES,
  PLATFORM_INTRO,
} from "@/lib/marketing-content";

export function CorePlatformFeaturesSection() {
  return (
    <section id="features" className="py-16">
      <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--pc-navy)]">
        {PLATFORM_INTRO.title}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">
        {PLATFORM_INTRO.subtitle}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CORE_PLATFORM_FEATURES.map((feature) => (
          <article key={feature.id} className="pc-card flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-slate-900">
                {feature.title}
              </h3>
              <StatusBadge status={feature.status} />
            </div>
            <p className="mt-2 flex-1 text-sm text-slate-600">
              {feature.description}
            </p>
            {feature.pulseModule && (
              <p className="mt-3 text-xs font-medium text-sky-700">
                {feature.pulseModule}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: "available" | "roadmap" }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        status === "available"
          ? "bg-sky-100 text-sky-800"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {status === "available" ? "Live" : "Roadmap"}
    </span>
  );
}
