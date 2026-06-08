"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FeatureIcon, SuiteLayerIcon } from "@/components/marketing/feature-icon";
import { StatusPill } from "@/components/marketing/status-pill";
import { SuiteModuleViz } from "@/components/marketing/suite-module-viz";
import type { FeatureMatrixIcon } from "@/lib/marketing-home";
import {
  LAYER_SPOTLIGHT_COPY,
  PULSE_PRODUCTS,
  PRODUCT_HIGHLIGHTS,
  PRODUCT_MARKETING_ICONS,
  SUITE_LAYER_FILTERS,
  SUITE_TRUST_SIGNALS,
  filterProductsByLayer,
  layerFilterMetrics,
  statusToCatalog,
  suiteMetrics,
  type SuiteLayerFilter,
} from "@/lib/suite-marketing";
import { MARKETING_SECTIONS } from "@/lib/marketing-home";
import type { ProductId, ProductLayer, PulseProduct } from "@/lib/products";
import { MarketingSectionHeader } from "@/components/marketing/marketing-section-header";

const LAYER_STACK: { layer: ProductLayer; label: string; className: string }[] = [
  { layer: "ams", label: "AMS", className: "mk-suite-stack-seg--ams" },
  { layer: "crm", label: "CRM", className: "mk-suite-stack-seg--crm" },
  { layer: "revenue", label: "Revenue", className: "mk-suite-stack-seg--revenue" },
];

function ReadinessRing({ pct, live, total }: { pct: number; live: number; total: number }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="mk-suite-ring-wrap">
      <div className="mk-suite-ring mk-suite-ring--compact" role="img" aria-label={`${live} of ${total} modules live`}>
        <svg className="mk-suite-ring-svg" viewBox="0 0 120 120" aria-hidden>
          <circle className="mk-suite-ring-glow" cx="60" cy="60" r={r + 4} />
          <circle className="mk-suite-ring-track" cx="60" cy="60" r={r} />
          <circle
            className="mk-suite-ring-progress"
            cx="60"
            cy="60"
            r={r}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="mk-suite-ring-label">
          <span className="mk-suite-ring-value">{pct}%</span>
          <span className="mk-suite-ring-caption">suite ready</span>
        </div>
      </div>
      <p className="mk-suite-ring-sub">
        {live} live · {total - live} preview
      </p>
    </div>
  );
}

function SuiteExecutiveStrip({
  live,
  preview,
  coming,
  total,
  readinessPct,
}: {
  live: number;
  preview: number;
  coming: number;
  total: number;
  readinessPct: number;
}) {
  return (
    <div className="mk-suite-exec glass" role="region" aria-label="Suite summary">
      <div className="mk-suite-exec-kpi mk-suite-exec-kpi--live">
        <span className="mk-suite-exec-value">{live}</span>
        <span className="mk-suite-exec-label">Live</span>
      </div>
      <div className="mk-suite-exec-kpi mk-suite-exec-kpi--preview">
        <span className="mk-suite-exec-value">{preview}</span>
        <span className="mk-suite-exec-label">Preview</span>
      </div>
      <div className="mk-suite-exec-kpi">
        <span className="mk-suite-exec-value">{total}</span>
        <span className="mk-suite-exec-label">Modules</span>
      </div>
      <div className="mk-suite-exec-kpi mk-suite-exec-kpi--ready">
        <span className="mk-suite-exec-value">{readinessPct}%</span>
        <span className="mk-suite-exec-label">Ready</span>
      </div>
      {coming > 0 ? (
        <div className="mk-suite-exec-kpi mk-suite-exec-kpi--soon">
          <span className="mk-suite-exec-value">{coming}</span>
          <span className="mk-suite-exec-label">Roadmap</span>
        </div>
      ) : null}
    </div>
  );
}

function LayerStackBar() {
  const counts = useMemo(() => {
    const ams = PULSE_PRODUCTS.filter((p) => p.layer === "ams").length;
    const crm = PULSE_PRODUCTS.filter((p) => p.layer === "crm").length;
    const revenue = PULSE_PRODUCTS.filter((p) => p.layer === "revenue").length;
    const total = ams + crm + revenue;
    return { ams, crm, revenue, total };
  }, []);

  return (
    <div className="mk-suite-stack" aria-label="Modules by layer">
      <div className="mk-suite-stack-bar">
        {LAYER_STACK.map(({ layer, className }) => (
          <span
            key={layer}
            className={`mk-suite-stack-seg ${className}`}
            style={{ width: `${(counts[layer] / counts.total) * 100}%` }}
            title={`${counts[layer]} modules`}
          />
        ))}
      </div>
      <ul className="mk-suite-stack-legend">
        {LAYER_STACK.map(({ layer, label }) => (
          <li key={layer}>
            <span className={`mk-suite-stack-dot mk-suite-stack-dot--${layer}`} />
            {label} · {counts[layer]}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustIcon({ id }: { id: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    "aria-hidden": true as const,
  };
  if (id === "imports") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
      </svg>
    );
  }
  if (id === "exports") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5-5 5M12 3v12" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path strokeLinecap="round" d="M9 12l2 2 4-4M12 22a10 10 0 110-20 10 10 0 010 20z" />
    </svg>
  );
}

function ModuleTile({
  product,
  active,
  index,
  onSelect,
}: {
  product: PulseProduct;
  active: boolean;
  index: number;
  onSelect: (id: ProductId) => void;
}) {
  const icon = PRODUCT_MARKETING_ICONS[product.id] as FeatureMatrixIcon;
  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      className={`mk-suite-module-tile ${active ? "mk-suite-module-tile--active" : ""} mk-suite-module-tile--${product.id}`}
      style={{ animationDelay: `${index * 35}ms` }}
      aria-pressed={active}
      aria-label={`${product.name}, ${product.status === "available" ? "live" : "preview"}`}
    >
      {active ? <span className="mk-suite-module-beacon" aria-hidden /> : null}
      <div className="mk-suite-module-icon">
        <FeatureIcon icon={icon} productId={product.id} size="hero" />
      </div>
      <span className="mk-suite-module-short">{product.shortName}</span>
      <StatusPill status={statusToCatalog(product.status)} />
    </button>
  );
}

function ModuleSpotlight({ product }: { product: PulseProduct }) {
  const icon = PRODUCT_MARKETING_ICONS[product.id] as FeatureMatrixIcon;
  const highlights = PRODUCT_HIGHLIGHTS[product.id];
  const isLive = product.status === "available";

  return (
    <aside
      key={product.id}
      className={`mk-suite-detail mk-suite-detail--${product.id} mk-bento-card pp-mkt-light-surface mk-suite-detail--shine`}
      aria-live="polite"
    >
      <header className="mk-suite-detail-head">
        <div className="mk-suite-detail-icon">
          <FeatureIcon icon={icon} productId={product.id} size="hero" />
        </div>
        <div className="mk-suite-detail-titles">
          <p className="mk-suite-detail-eyebrow">{product.toolLabel}</p>
          <h3 className="mk-suite-detail-name">{product.name}</h3>
        </div>
        <StatusPill status={statusToCatalog(product.status)} />
      </header>

      <div className="mk-suite-spotlight-grid">
        <div className="mk-suite-spotlight-copy">
          <p className="mk-suite-detail-tagline">{product.tagline}</p>
          <ul className="mk-suite-feature-list">
            {highlights.map((h) => (
              <li key={h}>
                <span className="mk-suite-feature-check" aria-hidden>
                  ✓
                </span>
                {h}
              </li>
            ))}
          </ul>
          <p className="mk-suite-detail-layer">
            <span className="mk-suite-detail-layer-badge">{product.layer.toUpperCase()}</span>
            {LAYER_SPOTLIGHT_COPY[product.layer]}
          </p>
          <div className="mk-suite-detail-actions">
            <Link href="/demo" className="pc-btn-primary mk-suite-detail-cta text-sm">
              {isLive ? "Open demo" : "Preview in demo"}
            </Link>
          </div>
        </div>
        <SuiteModuleViz productId={product.id} />
      </div>
    </aside>
  );
}

export function SuiteReadinessBand() {
  const [layer, setLayer] = useState<SuiteLayerFilter>("all");
  const [activeId, setActiveId] = useState<ProductId>("members");
  const [paused, setPaused] = useState(false);

  const filtered = useMemo(
    () => filterProductsByLayer(PULSE_PRODUCTS, layer),
    [layer],
  );
  const fullMetrics = useMemo(() => suiteMetrics(PULSE_PRODUCTS), []);
  const metrics = useMemo(() => suiteMetrics(filtered), [filtered]);
  const active =
    filtered.find((p) => p.id === activeId) ?? filtered[0] ?? PULSE_PRODUCTS[0]!;

  const selectModule = useCallback((id: ProductId) => {
    setActiveId(id);
    setPaused(true);
  }, []);

  const stepModule = useCallback(
    (dir: 1 | -1) => {
      const idx = filtered.findIndex((p) => p.id === activeId);
      const next = filtered[(idx + dir + filtered.length) % filtered.length];
      if (next) setActiveId(next.id);
      setPaused(true);
    },
    [filtered, activeId],
  );

  useEffect(() => {
    if (!filtered.some((p) => p.id === activeId)) {
      setActiveId(filtered[0]?.id ?? "members");
    }
  }, [filtered, activeId]);

  useEffect(() => {
    if (paused || filtered.length < 2) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const order = [
      ...filtered.filter((p) => p.status === "available"),
      ...filtered.filter((p) => p.status !== "available"),
    ];
    const tick = window.setInterval(() => {
      setActiveId((current) => {
        const idx = order.findIndex((p) => p.id === current);
        const next = order[(idx + 1) % order.length];
        return next?.id ?? current;
      });
    }, 5200);
    return () => window.clearInterval(tick);
  }, [filtered, paused, layer]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepModule(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepModule(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepModule]);

  const s = MARKETING_SECTIONS.suite;

  return (
    <section
      id="features"
      className="mk-suite-band mk-suite-band--pastel mk-section"
      aria-label="PulsePoint suite readiness"
    >
      <div className="mk-suite-ambient" aria-hidden>
        <span className="mk-suite-orb mk-suite-orb--a" />
        <span className="mk-suite-orb mk-suite-orb--b" />
        <span className="mk-suite-orb mk-suite-orb--c" />
      </div>

      <div className="mk-container">
        <div className="mk-suite-top">
          <MarketingSectionHeader
            align="left"
            eyebrow={s.eyebrow}
            title={s.title}
            lead={s.lead}
          />
          <ReadinessRing
            pct={fullMetrics.readinessPct}
            live={fullMetrics.live}
            total={fullMetrics.total}
          />
        </div>

        <SuiteExecutiveStrip
          live={fullMetrics.live}
          preview={fullMetrics.preview}
          coming={fullMetrics.coming}
          total={fullMetrics.total}
          readinessPct={fullMetrics.readinessPct}
        />

        <LayerStackBar />

        <div className="mk-suite-controls">
          <div className="mk-suite-layer-row" role="tablist" aria-label="Suite layer">
            {SUITE_LAYER_FILTERS.map((tab) => {
              const tabMetrics = layerFilterMetrics(PULSE_PRODUCTS, tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={layer === tab.id}
                  className={`mk-suite-layer-pill ${layer === tab.id ? "mk-suite-layer-pill--active" : ""}`}
                  onClick={() => setLayer(tab.id)}
                >
                  <SuiteLayerIcon id={tab.layerIcon} />
                  {tab.label}
                  <span className="mk-suite-layer-count">{tabMetrics.live}</span>
                </button>
              );
            })}
          </div>
          <div className="mk-suite-toolbar">
            <p className="mk-suite-toolbar-hint">
              <kbd className="mk-kbd">←</kbd> <kbd className="mk-kbd">→</kbd> browse ·{" "}
              {metrics.live} live
              {metrics.preview > 0 ? ` · ${metrics.preview} preview` : ""}
            </p>
            <button
              type="button"
              className={`mk-suite-tour-toggle ${paused ? "" : "mk-suite-tour-toggle--on"}`}
              onClick={() => setPaused((p) => !p)}
              aria-pressed={!paused}
            >
              <span className="mk-suite-tour-dot" aria-hidden />
              {paused ? "Tour paused" : "Auto tour"}
            </button>
          </div>
        </div>

        <div className="mk-suite-layout mk-suite-layout--pro">
          <div
            className="mk-suite-grid"
            onMouseEnter={() => setPaused(true)}
            onFocusCapture={() => setPaused(true)}
          >
            {filtered.map((product, i) => (
              <ModuleTile
                key={product.id}
                product={product}
                active={active.id === product.id}
                index={i}
                onSelect={selectModule}
              />
            ))}
          </div>

          {active ? <ModuleSpotlight product={active} /> : null}
        </div>

        <ul className="mk-suite-trust mk-suite-trust--compact">
          {SUITE_TRUST_SIGNALS.map((signal) => (
            <li key={signal.id} className="mk-suite-trust-item">
              <span className="mk-suite-trust-icon">
                <TrustIcon id={signal.icon} />
              </span>
              <div>
                <span className="mk-suite-trust-label">{signal.label}</span>
                <span className="mk-suite-trust-detail">{signal.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
