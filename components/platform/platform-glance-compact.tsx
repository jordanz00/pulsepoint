"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { StatusPill } from "@/components/marketing/status-pill";
import {
  GLANCE_LAYER_ORDER,
  GLANCE_SUITE_METRICS,
  PULSE_PRODUCTS,
  PRODUCT_LAYER_LABEL,
} from "@/lib/platform-glance";
import { moduleCssVars } from "@/lib/module-colors";
import { productHref } from "@/lib/products";
import { PRODUCT_MARKETING_ICONS, statusToCatalog } from "@/lib/suite-marketing";
import type { ProductLayer } from "@/lib/products";

type Props = {
  orgSlug: string;
  /** Highlight module matching current route (optional) */
  activeProductId?: string;
};

function layerClass(layer: ProductLayer) {
  if (layer === "ams") return "pp-glance-layer--ams";
  if (layer === "crm") return "pp-glance-layer--crm";
  return "pp-glance-layer--revenue";
}

/** Compact executive strip — command center + module context bars. */
export function PlatformGlanceCompact({ orgSlug, activeProductId }: Props) {
  const router = useRouter();
  const metrics = GLANCE_SUITE_METRICS;

  return (
    <section
      className="pp-glance-compact mk-liquid-glass pp-glass-surface"
      aria-label="PulsePoint suite at a glance"
    >
      <div className="pp-glance-compact-head">
        <div>
          <p className="pp-glance-briefing-kicker">Executive snapshot</p>
          <p className="pp-glance-compact-title">Twelve modules, one spine</p>
        </div>
        <div className="pp-glance-briefing-metrics pp-glance-compact-metrics">
          <span className="pp-glance-metric pp-glance-metric--live">
            <strong>{metrics.live}</strong> Live
          </span>
          <span className="pp-glance-metric pp-glance-metric--preview">
            <strong>{metrics.preview}</strong> Preview
          </span>
          <span className="pp-glance-metric">
            <strong>{metrics.total}</strong> modules
          </span>
          <span className="pp-glance-metric pp-glance-metric--ready">
            <strong>{metrics.readinessPct}%</strong> ready
          </span>
        </div>
        <Link href={`/${orgSlug}/suite`} className="pc-btn-secondary pp-glance-compact-suite-cta">
          Full suite
        </Link>
      </div>

      <div className="pp-glance-compact-layers" aria-hidden>
        {GLANCE_LAYER_ORDER.map((layer) => (
          <span key={layer} className={`pp-glance-compact-layer pp-glance-compact-layer--${layer}`}>
            {PRODUCT_LAYER_LABEL[layer]}
          </span>
        ))}
      </div>

      <div className="pp-glance-compact-grid" role="list" aria-label="All modules">
        {PULSE_PRODUCTS.map((mod) => {
          const selected = mod.id === activeProductId;
          const href = productHref(orgSlug, mod);
          const disabled = mod.status === "coming_soon";
          return (
            <Link
              key={mod.id}
              href={disabled ? `/${orgSlug}/suite` : href}
              role="listitem"
              className={`pp-glance-compact-chip ${layerClass(mod.layer)}${selected ? " is-active" : ""}`}
              style={selected ? moduleCssVars(mod.id) : undefined}
              onMouseEnter={() => {
                if (!disabled) router.prefetch(href);
              }}
              prefetch
            >
              <FeatureIcon icon={PRODUCT_MARKETING_ICONS[mod.id]} productId={mod.id} size="sm" />
              <span className="pp-glance-compact-chip-label">{mod.shortName}</span>
              <StatusPill status={statusToCatalog(mod.status)} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
