import Link from "next/link";
import { ProductSuiteGrid } from "@/components/product-suite-grid";
import { PageHeader } from "@/components/ui/page-header";
import { PULSE_WORK_SPOTLIGHT } from "@/lib/marketing-content";
import { productHref, PULSE_PRODUCTS } from "@/lib/products";
import { PRODUCT_PREVIEWS } from "@/lib/product-preview-content";

export default async function WorkProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const s = PULSE_WORK_SPOTLIGHT;
  const preview = PRODUCT_PREVIEWS.work;
  const liveProducts = PULSE_PRODUCTS.filter(
    (p) => p.status === "available" && p.id !== "work",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={s.productName}
        subtitle={s.category}
        badge="live"
      />

      <p className="max-w-2xl text-slate-600">{s.paragraphs[0]}</p>

      <section className="pc-card">
        <h2 className="text-lg font-semibold text-[var(--pc-navy)]">
          {preview.headline}
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {preview.bullets.map((b) => (
            <li
              key={b}
              className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600"
            >
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {liveProducts.map((p) => (
            <Link
              key={p.id}
              href={productHref(orgSlug, p)}
              className="pc-btn-primary text-sm"
            >
              {p.shortName}
            </Link>
          ))}
          <Link
            href={`/${orgSlug}/exceptions`}
            className="pc-btn-secondary text-sm"
          >
            Exceptions
          </Link>
          <Link
            href={`/${orgSlug}/members/imports`}
            className="pc-btn-secondary text-sm"
          >
            Import review
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--pc-navy)]">
          Full product suite
        </h2>
        <div className="mt-4">
          <ProductSuiteGrid orgSlug={orgSlug} />
        </div>
      </section>
    </div>
  );
}
