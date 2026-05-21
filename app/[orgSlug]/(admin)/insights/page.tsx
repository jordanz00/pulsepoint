import { getProduct } from "@/lib/products";
import { ProductComingSoon } from "@/components/product-coming-soon";

export default async function InsightsProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const product = getProduct("insights")!;

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Business Intelligence & Analytics
      </p>
      <ProductComingSoon product={product} orgSlug={orgSlug} />
    </div>
  );
}
