import Link from "next/link";
import { ModuleGlassCard, isLiquidGlassModule } from "@/components/ui/module-glass-card";
import { ProductModuleIcon } from "@/components/ui/product-module-icon";
import { HelpTip } from "@/components/ui/help-tip";
import { PRODUCT_HELP } from "@/lib/help-copy";
import {
  PULSE_PRODUCTS,
  PRODUCT_LAYER_LABEL,
  productHref,
  type ProductId,
  type ProductStatus,
} from "@/lib/products";

const STATUS_LABEL: Record<ProductStatus, string> = {
  available: "Live",
  alpha: "Preview",
  coming_soon: "Soon",
};

const LAYER_CLASS: Record<string, string> = {
  ams: "pp-tool-layer--ams",
  crm: "pp-tool-layer--crm",
  revenue: "pp-tool-layer--revenue",
};

export function ProductSuiteGrid({
  orgSlug,
  showHelp = true,
  compact = false,
  glass = false,
  liquid = false,
}: {
  orgSlug?: string;
  showHelp?: boolean;
  compact?: boolean;
  /** Frosted liquid-glass tiles (demo / suite explorer) */
  glass?: boolean;
  /** iOS module cards for Learn, Commerce, Giving, Engage, Insights (+ all when true) */
  liquid?: boolean;
}) {
  const live = PULSE_PRODUCTS.filter((p) => p.status === "available");
  const items = compact ? live : PULSE_PRODUCTS;
  const useLiquid = liquid || glass;
  const cardClass = glass && !liquid ? "pp-tool-card pp-tool-card--glass" : "pp-tool-card";

  if (useLiquid && !compact) {
    const liquidItems = liquid
      ? items.filter((p) => isLiquidGlassModule(p.id))
      : items;
    const legacyItems = liquid
      ? items.filter((p) => !isLiquidGlassModule(p.id))
      : [];

    return (
      <div className="space-y-6">
        <div className="pp-module-glass-grid">
          {liquidItems.map((product) => {
            const href = orgSlug ? productHref(orgSlug, product) : undefined;
            const clickable = product.status !== "coming_soon";
            return (
              <ModuleGlassCard
                key={product.id}
                product={product}
                href={orgSlug && clickable ? href : undefined}
              />
            );
          })}
        </div>
        {legacyItems.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            {legacyItems.map((product) => (
              <LegacyToolCard
                key={product.id}
                orgSlug={orgSlug}
                product={product}
                clickable={product.status !== "coming_soon"}
                showHelp={showHelp}
                compact={false}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={
        glass
          ? "pp-tool-grid pp-tool-grid--glass"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0"
      }
    >
      {items.map((product) => (
        <LegacyToolCard
          key={product.id}
          orgSlug={orgSlug}
          product={product}
          clickable={product.status !== "coming_soon"}
          showHelp={showHelp}
          compact={compact}
          cardClass={cardClass}
        />
      ))}
      {compact && orgSlug ? (
        <Link href={`/${orgSlug}/suite`} className={`${cardClass} pp-tool-card--more border-dashed`}>
          <ProductModuleIcon productId="work" size="lg" />
          <h3 className="pp-tool-card-title">All tools</h3>
          <p className="pp-tool-card-tagline">Reports, email, giving, and more.</p>
          <p className="pp-tool-card-cta">Open list →</p>
        </Link>
      ) : null}
    </div>
  );
}

function LegacyToolCard({
  orgSlug,
  product,
  clickable,
  showHelp,
  compact,
  cardClass = "pp-tool-card",
}: {
  orgSlug?: string;
  product: (typeof PULSE_PRODUCTS)[number];
  clickable: boolean;
  showHelp: boolean;
  compact: boolean;
  cardClass?: string;
}) {
  const href = orgSlug ? productHref(orgSlug, product) : "#";
  const help = PRODUCT_HELP[product.id];

  const inner = (
    <>
      <div className="pp-tool-card-top">
        <ProductModuleIcon productId={product.id as ProductId} size="lg" />
        <div className="pp-tool-card-badges">
          <span className={`pp-tool-layer ${LAYER_CLASS[product.layer]}`}>
            {PRODUCT_LAYER_LABEL[product.layer]}
          </span>
          <span className="pp-tool-status">{STATUS_LABEL[product.status]}</span>
        </div>
      </div>
      <h3 className="pp-tool-card-title">
        {product.shortName}
        {showHelp && !compact ? <HelpTip text={help} /> : null}
      </h3>
      <p className="pp-tool-card-tool">{product.toolLabel}</p>
      {!compact ? <p className="pp-tool-card-tagline">{product.tagline}</p> : null}
    </>
  );

  if (orgSlug && clickable) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${cardClass} opacity-80`}>
      {inner}
    </div>
  );
}
