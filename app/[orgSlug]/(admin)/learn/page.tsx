import { getProduct } from "@/lib/products";
import { ProductComingSoon } from "@/components/product-coming-soon";

export default async function LearnProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const product = getProduct("learn")!;

  return <ProductComingSoon product={product} orgSlug={orgSlug} />;
}
