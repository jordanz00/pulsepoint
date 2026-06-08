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

      <p className="max-w-3xl text-[var(--pc-text-secondary)]">{preview.vision}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="pc-card">
          <Badge variant="roadmap">{preview.targetPhase}</Badge>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--pc-text)]">
            {preview.headline}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--pc-text-secondary)]">
            {preview.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="font-semibold text-[var(--pc-brand)]">·</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-[var(--pc-accent-soft)] px-4 py-3 text-sm text-[var(--pc-text-secondary)]">
            <strong className="text-[var(--pc-text)]">vs legacy AMS:</strong> {preview.vsProtech}
          </div>
        </section>

        <section className="space-y-6">
          <div className="pc-card">
            <h3 className="text-sm font-semibold text-[var(--pc-text)]">Dependencies</h3>
            <ul className="mt-2 list-inside list-disc text-sm text-[var(--pc-text-secondary)]">
              {preview.dependencies.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="pc-card">
            <h3 className="text-sm font-semibold text-[var(--pc-text)]">Pilot success metrics</h3>
            <ul className="mt-2 list-inside list-disc text-sm text-[var(--pc-text-secondary)]">
              {preview.successMetrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="pc-card border-dashed">
            <p className="text-sm text-[var(--pc-text-secondary)]">{preview.liveAlternative}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${orgSlug}/members`} className="pc-btn-primary text-sm">
                MemberCore
              </Link>
              <Link href={`/${orgSlug}/events`} className="pc-btn-secondary text-sm">
                Events
              </Link>
              <Link href={`/${orgSlug}/work`} className="pc-btn-secondary text-sm">
                Work
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
