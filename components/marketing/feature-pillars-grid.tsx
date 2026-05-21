import Link from "next/link";
import { FEATURE_PILLARS, pillarHref } from "@/lib/feature-pillars";
import { getProduct } from "@/lib/products";

export function FeaturePillarsGrid({ orgSlug }: { orgSlug?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURE_PILLARS.map((pillar) => {
        const product = pillar.productId ? getProduct(pillar.productId) : null;
        const label = product?.name ?? `PulsePoint ${pillar.title}`;
        const href = orgSlug ? pillarHref(orgSlug, pillar) : null;
        const available = pillar.status === "available";

        const content = (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{pillar.title}</h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  available
                    ? "bg-sky-100 text-sky-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {available ? "Available" : "Roadmap"}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-sm text-slate-600">{pillar.description}</p>
          </>
        );

        if (href) {
          return (
            <Link
              key={pillar.id}
              href={href}
              className="pc-card transition hover:border-sky-200 hover:shadow-md"
            >
              {content}
            </Link>
          );
        }

        return (
          <div key={pillar.id} className="pc-card">
            {content}
          </div>
        );
      })}
    </div>
  );
}
