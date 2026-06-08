"use client";

import Link from "next/link";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { StatusPill } from "@/components/marketing/status-pill";
import { SuiteModuleViz } from "@/components/marketing/suite-module-viz";
import { moduleCssVars } from "@/lib/module-colors";
import { getProduct, type ProductId } from "@/lib/products";
import { PRODUCT_HIGHLIGHTS, PRODUCT_MARKETING_ICONS, statusToCatalog } from "@/lib/suite-marketing";

type Props = {
  orgSlug: string;
  productId: ProductId;
  liveStat?: string;
};

/** Glass module header — matches marketing At a Glance detail stage. */
export function ModuleLandingBriefingPanel({ orgSlug, productId, liveStat }: Props) {
  const product = getProduct(productId);
  if (!product) return null;

  const isLive = product.status === "available";

  return (
    <section
      className="pp-mod-landing mk-liquid-glass pp-glass-interactive"
      aria-label={`${product.shortName} module overview`}
      style={moduleCssVars(productId)}
    >
      <div className="pp-mod-landing-shine" aria-hidden />
      <div className="pp-mod-landing-main">
        <div className="pp-mod-landing-copy glass pp-glass-surface">
          <div className="pp-glance-detail-head">
            <FeatureIcon
              icon={PRODUCT_MARKETING_ICONS[productId]}
              productId={productId}
              size="md"
            />
            <div>
              <p className="pp-glance-detail-eyebrow">{product.toolLabel}</p>
              <h2 className="pp-mod-landing-title">{product.name}</h2>
            </div>
            <StatusPill status={statusToCatalog(product.status)} />
          </div>
          {liveStat && isLive ? <p className="pp-glance-detail-live-stat">{liveStat}</p> : null}
          <p className="pp-glance-detail-lead">{product.tagline}</p>
          <ul className="pp-mod-landing-highlights">
            {PRODUCT_HIGHLIGHTS[productId].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="pp-mod-landing-actions">
            <Link href={`/${orgSlug}/suite`} className="pc-btn-secondary text-sm">
              All modules
            </Link>
          </div>
        </div>
        <div className="pp-mod-landing-viz glass pp-glass-surface">
          <SuiteModuleViz productId={productId} />
        </div>
      </div>
      <p className="pp-mod-landing-foot">
        {isLive && liveStat
          ? "Live counts from your database · Preview charts labeled sample"
          : "Sample data in preview modules · Live & Preview labels match contracts"}
      </p>
    </section>
  );
}
