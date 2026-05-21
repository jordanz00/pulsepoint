import Link from "next/link";
import { PULSE_PRODUCTS, productHref } from "@/lib/products";

export function ProductSuiteGrid({ orgSlug }: { orgSlug?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PULSE_PRODUCTS.map((product) => {
        const href = orgSlug ? productHref(orgSlug, product) : "#";
        const available = product.status === "available";

        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-zinc-900">{product.name}</h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  available
                    ? "bg-sky-100 text-sky-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {available ? "Available" : "Coming soon"}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{product.tagline}</p>
          </>
        );

        if (orgSlug && available) {
          return (
            <Link
              key={product.id}
              href={href}
              className="pc-card text-left transition hover:border-sky-200 hover:shadow-md"
            >
              {inner}
            </Link>
          );
        }

        return (
          <div
            key={product.id}
            className="pc-card text-left"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
