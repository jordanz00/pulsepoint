/**
 * ProductModuleIcon — iOS liquid-glass squircles shared with marketing (FeatureIcon).
 * Use across admin demo, suite grid, and sidebar for cohesive color + glyph system.
 */

import { FeatureIcon } from "@/components/marketing/feature-icon";
import type { FeatureMatrixIcon } from "@/lib/marketing-home";
import type { ProductId } from "@/lib/products";
import { PRODUCT_MARKETING_ICONS } from "@/lib/suite-marketing";

export type ProductIconSize = "nav" | "sm" | "md" | "lg" | "xl" | "hero";

const featureSize: Record<ProductIconSize, "sm" | "md" | "lg" | "xl" | "hero"> = {
  nav: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  hero: "hero",
};

export function ProductModuleIcon({
  productId,
  size = "lg",
  className = "",
}: {
  productId: ProductId;
  size?: ProductIconSize;
  className?: string;
}) {
  const icon = PRODUCT_MARKETING_ICONS[productId];

  return (
    <span
      className={`pp-glass-icon pp-glass-icon--${size} ${className}`.trim()}
      aria-hidden
    >
      <FeatureIcon icon={icon} productId={productId} size={featureSize[size]} />
    </span>
  );
}

/** Sidebar / nav when item is not tied to a product module */
export function NavGlyphIcon({
  glyph,
  tone = "work",
  size = "nav",
}: {
  glyph: FeatureMatrixIcon | "home" | "settings" | "tour";
  tone?: ProductId;
  size?: ProductIconSize;
}) {
  const icon: FeatureMatrixIcon =
    glyph === "home" || glyph === "settings" || glyph === "tour" ? "work" : glyph;

  return (
    <span className={`pp-glass-icon pp-glass-icon--${size} pp-glass-icon--nav-glyph`} aria-hidden>
      {glyph === "home" ? (
        <span className={`mk-icon-tile mk-icon-tile--${tone}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
            />
          </svg>
        </span>
      ) : glyph === "settings" ? (
        <span className={`mk-icon-tile mk-icon-tile--${tone}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
      ) : glyph === "tour" ? (
        <span className={`mk-icon-tile mk-icon-tile--${tone}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </span>
      ) : (
        <FeatureIcon icon={icon} productId={tone} size={featureSize[size]} />
      )}
    </span>
  );
}
