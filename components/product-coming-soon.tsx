import Link from "next/link";
import type { PulseProduct } from "@/lib/products";
import { PRODUCT_PREVIEWS } from "@/lib/product-preview-content";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

export function ProductComingSoon({
  product,
  orgSlug,
}: {
  product: PulseProduct;
  orgSlug: string;
}) {
  const preview = PRODUCT_PREVIEWS[product.id];

  return (
    <div className="space-y-8">
      <PageHeader
        title={product.name}
        subtitle={product.tagline}
        badge="roadmap"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="pc-card">
          <h2 className="text-lg font-semibold text-[var(--pc-navy)]">
            {preview.headline}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {preview.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-sky-500">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {preview.liveAlternative}
          </p>
        </section>

        <section className="pc-card border-dashed border-sky-200 bg-sky-50/30">
          <Badge variant="roadmap">Prototype preview</Badge>
          <p className="mt-4 text-sm text-slate-600">
            PulsePoint ships modules incrementally with honest Live / Roadmap labels—unlike
            legacy AMS demos that imply everything is finished.
          </p>
          <p className="mt-4 text-sm font-medium text-[var(--pc-navy)]">
            Use today while this module is on the roadmap:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/${orgSlug}/members`} className="pc-btn-primary text-sm">
              MemberCore
            </Link>
            <Link href={`/${orgSlug}/events`} className="pc-btn-secondary text-sm">
              PulsePoint Events
            </Link>
            <Link href={`/${orgSlug}/work`} className="pc-btn-secondary text-sm">
              PulsePoint Work
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
