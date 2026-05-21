import Link from "next/link";
import { MARKETING_PERSONAS } from "@/lib/marketing-catalog";

export function PersonasSection() {
  return (
    <section className="py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {MARKETING_PERSONAS.map((persona) => (
          <article key={persona.id} className="pc-card flex flex-col">
            <h3 className="text-xl font-bold text-[var(--pc-navy)]">
              {persona.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {persona.description}
            </p>
            {persona.productModule && (
              <p className="mt-3 text-xs font-medium text-sky-600">
                {persona.productModule}
              </p>
            )}
            <Link
              href="/sign-up"
              className="mt-4 text-sm font-semibold text-[var(--pc-navy)] hover:text-sky-600"
            >
              {persona.cta} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
