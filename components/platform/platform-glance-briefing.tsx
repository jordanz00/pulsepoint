"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { StatusPill } from "@/components/marketing/status-pill";
import { SuiteModuleViz } from "@/components/marketing/suite-module-viz";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import {
  GLANCE_AUDIENCES,
  GLANCE_FOUNDATIONS,
  GLANCE_LAYER_ORDER,
  GLANCE_SUITE_METRICS,
  GLANCE_VIEWS,
  PULSE_PRODUCTS,
  PRODUCT_LAYER_LABEL,
  type GlanceViewId,
} from "@/lib/platform-glance";
import { moduleCssVars } from "@/lib/module-colors";
import { productHref } from "@/lib/products";
import {
  PRODUCT_HIGHLIGHTS,
  PRODUCT_MARKETING_ICONS,
  statusToCatalog,
} from "@/lib/suite-marketing";
import type { ProductId, ProductLayer } from "@/lib/products";

const DEFAULT_MODULE: ProductId = "members";

function layerClass(layer: ProductLayer) {
  if (layer === "ams") return "pp-glance-layer--ams";
  if (layer === "crm") return "pp-glance-layer--crm";
  return "pp-glance-layer--revenue";
}

function audienceHref(orgSlug: string, demoHref: string): string {
  return demoHref.replace(/^\/demo-healthcare/, `/${orgSlug}`);
}

type Props = {
  orgSlug: string;
  moduleStats?: Partial<Record<ProductId, string>>;
  /** Subset of Platform / Who we serve / How it's built — default all three */
  enabledViews?: GlanceViewId[];
  className?: string;
};

/** Interactive suite briefing — marketing + admin (same liquid-glass UX). */
export function PlatformGlanceBriefing({
  orgSlug,
  moduleStats,
  enabledViews,
  className = "",
}: Props) {
  const views = useMemo(
    () =>
      enabledViews
        ? GLANCE_VIEWS.filter((v) => enabledViews.includes(v.id))
        : GLANCE_VIEWS,
    [enabledViews],
  );
  const defaultView = views[0]?.id ?? "platform";

  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [view, setView] = useState<GlanceViewId>(defaultView);
  const [activeModule, setActiveModule] = useState<ProductId>(DEFAULT_MODULE);
  const [activeAudience, setActiveAudience] = useState(0);
  const [activeFoundation, setActiveFoundation] = useState(0);
  const [layerFilter, setLayerFilter] = useState<ProductLayer | "all">("all");

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  useEffect(() => {
    if (!views.some((v) => v.id === view)) {
      setView(defaultView);
    }
  }, [views, view, defaultView]);

  const metrics = GLANCE_SUITE_METRICS;
  const product = PULSE_PRODUCTS.find((p) => p.id === activeModule)!;
  const audience = GLANCE_AUDIENCES[activeAudience]!;
  const foundation = GLANCE_FOUNDATIONS[activeFoundation]!;
  const liveStat = moduleStats?.[product.id];
  const isLiveModule = product.status === "available";

  const filteredModules = useMemo(() => {
    if (layerFilter === "all") return PULSE_PRODUCTS;
    return PULSE_PRODUCTS.filter((p) => p.layer === layerFilter);
  }, [layerFilter]);

  const activeStyle = moduleCssVars(
    view === "platform"
      ? product.id
      : view === "audience"
        ? audience.productId
        : foundation.productId,
  );

  return (
    <div
      className={`pp-glance-briefing mk-liquid-glass pp-glass-interactive${ready ? " pp-glance-briefing--ready" : ""} ${className}`.trim()}
      role="region"
      aria-label="PulsePoint platform glance"
      style={activeStyle}
    >
      <div className="pp-glance-briefing-shine" aria-hidden />

      <header className="pp-glance-briefing-head">
        <div>
          <p className="pp-glance-briefing-kicker">Executive snapshot</p>
          <h3 className="pp-glance-briefing-title">
            {GLANCE_VIEWS.find((v) => v.id === view)?.title}
          </h3>
        </div>
        <div className="pp-glance-briefing-metrics" aria-label="Suite readiness">
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
      </header>

      {views.length > 1 ? (
        <div className="pp-glance-briefing-tabs" role="tablist" aria-label="Glance views">
          {views.map((item) => {
            const selected = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`pp-glance-briefing-tab${selected ? " is-active" : ""}`}
                onClick={() => setView(item.id)}
                onMouseEnter={() => setView(item.id)}
              >
                {item.chip}
              </button>
            );
          })}
        </div>
      ) : null}

      {view === "platform" ? (
        <>
          <div className="pp-glance-layer-filters" role="group" aria-label="Filter by layer">
            <button
              type="button"
              className={`pp-glance-layer-pill${layerFilter === "all" ? " is-active" : ""}`}
              onClick={() => setLayerFilter("all")}
            >
              Full suite
            </button>
            {GLANCE_LAYER_ORDER.map((layer) => (
              <button
                key={layer}
                type="button"
                className={`pp-glance-layer-pill pp-glance-layer-pill--${layer}${layerFilter === layer ? " is-active" : ""}`}
                onClick={() => setLayerFilter(layer)}
              >
                {PRODUCT_LAYER_LABEL[layer]}
              </button>
            ))}
          </div>

          <div className="pp-glance-module-grid" role="listbox" aria-label="PulsePoint modules">
            {filteredModules.map((mod) => {
              const selected = mod.id === activeModule;
              return (
                <button
                  key={mod.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`pp-glance-module${selected ? " is-active" : ""} ${layerClass(mod.layer)}`}
                  style={selected ? moduleCssVars(mod.id) : undefined}
                  onClick={() => setActiveModule(mod.id)}
                  onMouseEnter={() => {
                    setActiveModule(mod.id);
                    if (mod.status !== "coming_soon") {
                      router.prefetch(productHref(orgSlug, mod));
                    }
                  }}
                >
                  <FeatureIcon
                    icon={PRODUCT_MARKETING_ICONS[mod.id]}
                    productId={mod.id}
                    size="sm"
                  />
                  <span className="pp-glance-module-name">{mod.shortName}</span>
                  <StatusPill status={statusToCatalog(mod.status)} />
                </button>
              );
            })}
          </div>

          <div className="pp-glance-platform-stage">
            <div className="pp-glance-detail glass pp-glass-surface">
              <div className="pp-glance-detail-head">
                <FeatureIcon
                  icon={PRODUCT_MARKETING_ICONS[product.id]}
                  productId={product.id}
                  size="md"
                />
                <div>
                  <p className="pp-glance-detail-eyebrow">{product.toolLabel}</p>
                  <h4 className="pp-glance-detail-title">{product.name}</h4>
                </div>
                <StatusPill status={statusToCatalog(product.status)} />
              </div>
              {liveStat && isLiveModule ? (
                <p className="pp-glance-detail-live-stat">{liveStat}</p>
              ) : null}
              <p className="pp-glance-detail-lead">{product.tagline}</p>
              <ul className="pp-glance-detail-list">
                {PRODUCT_HIGHLIGHTS[product.id].map((line) => (
                  <li key={line}>
                    <span aria-hidden>✓</span>
                    {line}
                  </li>
                ))}
              </ul>
              {product.status !== "coming_soon" ? (
                <Link
                  href={productHref(orgSlug, product)}
                  className="btn btn-primary pp-glance-detail-cta"
                  prefetch
                >
                  Open module
                </Link>
              ) : (
                <span className="pp-glance-detail-soon">Coming soon</span>
              )}
            </div>
            <div className="pp-glance-viz glass pp-glass-surface">
              {liveStat && isLiveModule ? (
                <p className="pp-glance-viz-live-note">{liveStat}</p>
              ) : null}
              <SuiteModuleViz productId={product.id} />
            </div>
          </div>
        </>
      ) : null}

      {view === "audience" ? (
        <div className="pp-glance-audience-stage">
          <div className="pp-glance-audience-tabs" role="tablist" aria-label="Audiences">
            {GLANCE_AUDIENCES.map((row, i) => {
              const selected = i === activeAudience;
              return (
                <button
                  key={row.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`pp-glance-audience-tab${selected ? " is-active" : ""}`}
                  style={selected ? moduleCssVars(row.productId) : undefined}
                  onClick={() => setActiveAudience(i)}
                  onMouseEnter={() => setActiveAudience(i)}
                >
                  {row.title}
                </button>
              );
            })}
          </div>
          <div className="pp-glance-detail glass pp-glass-surface" aria-live="polite">
            <p className="pp-glance-detail-eyebrow">{audience.title}</p>
            <h4 className="pp-glance-detail-title">{audience.headline}</h4>
            <ul className="pp-glance-detail-list">
              {audience.bullets.map((line) => (
                <li key={line}>
                  <span aria-hidden>✓</span>
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href={audienceHref(orgSlug, audience.demoHref)}
              className="btn btn-primary pp-glance-detail-cta"
              prefetch
            >
              See it in demo
            </Link>
          </div>
        </div>
      ) : null}

      {view === "foundation" ? (
        <div className="pp-glance-foundation-stage">
          <div className="pp-glance-foundation-tabs" role="tablist" aria-label="Platform foundations">
            {GLANCE_FOUNDATIONS.map((row, i) => {
              const selected = i === activeFoundation;
              return (
                <button
                  key={row.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`pp-glance-foundation-tab${selected ? " is-active" : ""}`}
                  style={selected ? moduleCssVars(row.productId) : undefined}
                  onClick={() => setActiveFoundation(i)}
                  onMouseEnter={() => setActiveFoundation(i)}
                >
                  {row.title}
                </button>
              );
            })}
          </div>
          <div className="pp-glance-detail glass pp-glass-surface" aria-live="polite">
            <h4 className="pp-glance-detail-title">{foundation.title}</h4>
            <p className="pp-glance-detail-lead">{foundation.summary}</p>
            <ul className="pp-glance-detail-list">
              {foundation.checklist.map((line) => (
                <li key={line}>
                  <span aria-hidden>✓</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <footer className="pp-glance-briefing-foot">
        <p className="pp-glance-briefing-foot-note">
          {moduleStats
            ? "Live counts from your database · Preview modules use sample charts"
            : "Sample data in previews · Live & Preview labels match contracts"}
        </p>
      </footer>
    </div>
  );
}
