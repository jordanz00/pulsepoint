import { getProduct } from "@/lib/products";
import { ProductComingSoon } from "@/components/product-coming-soon";

export default async function CommerceProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const product = getProduct("commerce")!;

  return <ProductComingSoon product={product} orgSlug={orgSlug} />;
}
