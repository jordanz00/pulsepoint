import { getProduct } from "@/lib/products";
import { ProductComingSoon } from "@/components/product-coming-soon";

export default async function EngageProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const product = getProduct("engage")!;

  return <ProductComingSoon product={product} orgSlug={orgSlug} />;
}
