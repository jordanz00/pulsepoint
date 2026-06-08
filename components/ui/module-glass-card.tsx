import Link from "next/link";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { PRODUCT_ICON_TONES, PRODUCT_MARKETING_ICONS } from "@/lib/suite-marketing";
import type { ProductId, ProductStatus, PulseProduct } from "@/lib/products";

const STATUS_BADGE: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  available: { label: "Live", className: "pp-module-glass-card__badge--live" },
  alpha: { label: "Alpha", className: "pp-module-glass-card__badge--alpha" },
  coming_soon: { label: "Soon", className: "pp-module-glass-card__badge--soon" },
};

function CardArrow() {
  return (
    <svg
      className="pp-module-glass-card__arrow"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ModuleGlassCardProps = {
  product: PulseProduct;
  href?: string;
  description?: string;
  /** Override displayed module name (e.g. Member portal) */
  title?: string;
  className?: string;
};

function CardInner({
  product,
  description,
  title,
}: {
  product: PulseProduct;
  description: string;
  title: string;
}) {
  const icon = PRODUCT_MARKETING_ICONS[product.id];
  const variant = PRODUCT_ICON_TONES[product.id];
  const badge = STATUS_BADGE[product.status];

  return (
    <>
      <div className={`pp-module-glass-card__icon pp-module-glass-card__icon--${product.id}`}>
        <FeatureIcon icon={icon} variant={variant} size="sm" />
      </div>
      <h3 className="pp-module-glass-card__title">{title}</h3>
      <p className="pp-module-glass-card__desc">{description}</p>
      <div className="pp-module-glass-card__footer">
        <span className={`pp-module-glass-card__badge ${badge.className}`}>{badge.label}</span>
        <CardArrow />
      </div>
    </>
  );
}

export function ModuleGlassCard({
  product,
  href,
  description,
  title,
  className = "",
}: ModuleGlassCardProps) {
  const text = description ?? product.tagline;
  const displayTitle = title ?? product.shortName;
  const classes = `pp-module-glass-card pp-module-glass-card--${product.id} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        <CardInner product={product} description={text} title={displayTitle} />
      </Link>
    );
  }

  return (
    <div className={`${classes} pp-module-glass-card--static`}>
      <CardInner product={product} description={text} title={displayTitle} />
    </div>
  );
}

/** Learn, Commerce, Giving, Engage, Insights — preview modules with liquid glass cards */
export const LIQUID_GLASS_MODULE_IDS: ProductId[] = [
  "learn",
  "commerce",
  "giving",
  "engage",
  "insights",
];

export function isLiquidGlassModule(id: ProductId): boolean {
  return LIQUID_GLASS_MODULE_IDS.includes(id);
}
