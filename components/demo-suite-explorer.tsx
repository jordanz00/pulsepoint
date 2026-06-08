import Link from "next/link";
import { ModuleGlassCard } from "@/components/ui/module-glass-card";
import { buildSuiteModuleCards } from "@/lib/demo-suite";
import { PULSE_PRODUCTS, PRODUCT_LAYER_LABEL, type ProductLayer } from "@/lib/products";
import { walkthroughPageHref } from "@/lib/demo-walkthrough";

export function DemoSuiteExplorer({
  orgSlug,
  stats,
}: {
  orgSlug: string;
  stats: Record<string, string>;
}) {
  const cards = buildSuiteModuleCards(orgSlug);
  const productById = new Map(PULSE_PRODUCTS.map((p) => [p.id, p]));
  const layerOrder: ProductLayer[] = ["ams", "crm", "revenue"];

  return (
    <div className="space-y-8">
      <div className="pp-suite-intro glass">
        <p className="pp-suite-intro-copy">
          <Link href={walkthroughPageHref(orgSlug, 0)} className="pc-link font-semibold">
            Prefer a guided tour?
          </Link>{" "}
          We can walk you through step by step.
        </p>
      </div>

      {layerOrder.map((layer) => {
        const layerCards = cards.filter((card) => {
          if (!card.productId) return false;
          const product = productById.get(card.productId);
          return product?.layer === layer;
        });
        if (layerCards.length === 0) return null;

        return (
          <section key={layer} className={`pp-suite-section pp-suite-section--${layer}`}>
            <div className="pp-suite-section-head">
              <h2 className="pp-suite-section-title">{PRODUCT_LAYER_LABEL[layer]}</h2>
              <p className="pp-suite-section-meta">
                {layerCards.filter((card) => card.status === "live").length} live ·{" "}
                {layerCards.filter((card) => card.status !== "live").length} preview
              </p>
            </div>
            <div className="pp-module-glass-grid">
              {layerCards.map((card) => {
                const product = card.productId ? productById.get(card.productId) : undefined;
                if (!product) return null;
                return (
                  <ModuleGlassCard
                    key={card.id}
                    product={product}
                    href={card.href}
                    description={stats[card.id] ?? card.tagline}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

    </div>
  );
}
