import { getProduct } from "@/lib/products";
import { ProductComingSoon } from "@/components/product-coming-soon";

export default async function AiProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const product = getProduct("ai")!;

  return <ProductComingSoon product={product} orgSlug={orgSlug} />;
}
