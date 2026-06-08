"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HERO_PREVIEW_ACTIVITY,
  HERO_PREVIEW_KPIS,
  HERO_PREVIEW_MEMBERSHIP_MIX,
  HERO_PREVIEW_TILES,
  type HeroPreviewTile,
} from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import { modGlassKpiProps, modGlassTileProps, modMixSegmentProps } from "@/lib/marketing-module-glass";
import { BrandLogo } from "@/components/brand-logo";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { HeroPreviewInsights } from "@/components/marketing/hero-preview-insights";
import { ExecutiveKpiNumber } from "@/components/marketing/executive-kpi-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { usePreviewCarousel } from "@/lib/use-preview-carousel";

const TILE_FEED_INDEX: Record<string, number> = {
  insights: 0,
  members: 1,
  events: 2,
  commerce: 0,
  engage: 1,
};

type PreviewView = "overview" | "modules" | "revenue";

const VIEW_TABS: { id: PreviewView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "modules", label: "Modules" },
  { id: "revenue", label: "Revenue" },
];

function PreviewTile({
  tile,
  delayMs,
  spotlight,
  onSelect,
}: {
  tile: HeroPreviewTile;
  delayMs: number;
  spotlight: boolean;
  onSelect: () => void;
}) {
  const glass = modGlassTileProps(tile.productId, spotlight);

  return (
    <button
      type="button"
      {...glass}
      className={`${glass.className} mk-preview-tile mk-preview-hit pp-motion-tile`}
      style={{ ...glass.style, animationDelay: `${delayMs}ms` }}
      aria-current={spotlight ? "true" : undefined}
      aria-pressed={spotlight}
      onClick={onSelect}
    >
      <div className="mk-preview-tile-icon">
        <FeatureIcon icon={tile.icon} productId={tile.productId} />
      </div>
      <div className="mk-preview-tile-body">
        <p className="mk-preview-tile-module">{tile.module}</p>
        <p className="mk-preview-tile-title">{tile.title}</p>
      </div>
      <span className={tile.status === "live" ? "badge-live" : "badge-alpha"}>
        {tile.status === "live" ? "Live" : "Preview"}
      </span>
    </button>
  );
}

function PreviewActivityStrip({
  activeIndex,
  reduced,
  onPick,
}: {
  activeIndex: number;
  reduced: boolean;
  onPick: (i: number) => void;
}) {
  return (
    <div className="mk-preview-activity-strip" aria-label="Recent activity">
      <p className="mk-preview-eyebrow">Recent activity</p>
      <div className="mk-preview-activity-row">
        {HERO_PREVIEW_ACTIVITY.map((item, i) => {
          const active = reduced ? i === 0 : i === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              className={`mk-preview-activity-card mk-preview-hit${active ? " is-active" : ""}`}
              style={moduleCssVars(item.productId)}
              aria-pressed={active}
              onClick={() => onPick(i)}
            >
              <span className="mk-preview-activity-dot" aria-hidden />
              <span className="mk-preview-activity-copy">
                <span className="mk-preview-activity-label">{item.label}</span>
                <span className="mk-preview-activity-detail">{item.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MembershipMixStrip() {
  const mix = HERO_PREVIEW_MEMBERSHIP_MIX;
  const segments = [
    { key: "general", label: "General", ...mix.general },
    { key: "associate", label: "Associate", ...mix.associate },
    { key: "other", label: "Other", ...mix.other },
  ] as const;

  return (
    <div className="mk-preview-mix mk-mod-glass-panel mk-mod-glass-panel--neutral">
      <p className="mk-preview-eyebrow">Membership mix</p>
      <div className="mk-preview-mix-bar" role="presentation">
        {segments.map((s) => {
          const seg = modMixSegmentProps(s.productId, s.pct);
          return <span key={s.key} {...seg} title={`${s.label} ${s.pct}%`} />;
        })}
      </div>
      <ul className="mk-preview-mix-legend">
        {segments.map((s) => (
          <li key={s.key}>
            <span className="mk-mod-glass-mix-dot" style={moduleCssVars(s.productId)} />
            {s.label} {s.pct}%
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroProductPreview({ demoHref = "/demo" }: { demoHref?: string }) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const [view, setView] = useState<PreviewView>("overview");
  const [kpiFocus, setKpiFocus] = useState<number | null>(null);
  const [feedIndex, setFeedIndex] = useState(0);
  const [hovering, setHovering] = useState(false);

  const tileCarousel = usePreviewCarousel(
    HERO_PREVIEW_TILES.length,
    3200,
    reduced,
    hovering,
  );
  const tileIndex = tileCarousel.index;

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  useEffect(() => {
    const tile = HERO_PREVIEW_TILES[tileIndex];
    if (!tile) return;
    setFeedIndex(TILE_FEED_INDEX[tile.productId] ?? tileIndex % HERO_PREVIEW_ACTIVITY.length);
  }, [tileIndex]);

  const activeKpiIndex =
    kpiFocus !== null
      ? kpiFocus
      : (() => {
          const tile = HERO_PREVIEW_TILES[tileIndex];
          if (!tile) return 0;
          const idx = HERO_PREVIEW_KPIS.findIndex((k) => k.productId === tile.productId);
          return idx >= 0 ? idx : 0;
        })();

  const activeTile = HERO_PREVIEW_TILES[tileIndex];

  const pickTile = (i: number) => {
    tileCarousel.pick(i);
    setKpiFocus(null);
    setView("modules");
  };

  const pickKpi = (i: number) => {
    setKpiFocus(i);
    tileCarousel.pause();
    const productId = HERO_PREVIEW_KPIS[i]?.productId;
    const tileIdx = HERO_PREVIEW_TILES.findIndex((t) => t.productId === productId);
    if (tileIdx >= 0) tileCarousel.pick(tileIdx);
  };

  const shellClass = [
    "glass",
    "pp-mkt-light-surface",
    "mk-preview-shell",
    "mk-liquid-glass",
    "mk-preview-shell--animated",
    "pp-glass-interactive",
    ready ? "mk-preview-shell--ready" : "",
    hovering ? "mk-preview-shell--hover" : "",
    tileCarousel.manualPause ? "mk-preview-shell--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={shellClass}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="mk-preview-shine" aria-hidden />
      <div className="mk-preview-ambient" aria-hidden />

      <header className="mk-preview-chrome">
        <BrandLogo size="sm" />
        <div className="mk-preview-chrome-title">
          <span className="mk-preview-chrome-brand">PulsePoint</span>
          <span className="mk-preview-chrome-sep" aria-hidden>
            ·
          </span>
          <span className="mk-preview-chrome-view">
            <span className="mk-preview-live-dot" aria-hidden />
            Association overview
          </span>
        </div>
        <Link href={demoHref} className="btn-primary mk-preview-chrome-cta mk-preview-cta-shine">
          Open demo
        </Link>
      </header>

      <div className="mk-preview-toolbar">
        <div className="mk-preview-tabs" role="tablist" aria-label="Preview views">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={view === tab.id}
              className={`mk-preview-tab mk-preview-hit${view === tab.id ? " is-active" : ""}`}
              onClick={() => {
                setView(tab.id);
                tileCarousel.pause();
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="mk-preview-hint">Sample data · tap a metric to explore</p>
      </div>

      {view === "overview" && (
        <>
          <div className="mk-preview-kpi-strip mk-preview-kpi-strip--executive" aria-label="Sample key metrics">
            {HERO_PREVIEW_KPIS.map((kpi, i) => {
              const glass = modGlassKpiProps(kpi.productId, !reduced && activeKpiIndex === i);
              return (
                <button
                  key={kpi.id}
                  type="button"
                  {...glass}
                  className={`${glass.className} mk-preview-hit`}
                  aria-pressed={activeKpiIndex === i}
                  onClick={() => pickKpi(i)}
                >
                  <span className="mk-preview-kpi-label">{kpi.label}</span>
                  <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
                    <ExecutiveKpiNumber
                      value={kpi.value}
                      prefix={kpi.prefix}
                      suffix={kpi.suffix}
                    />
                  </span>
                  <span className="mk-preview-kpi-delta">{kpi.delta}</span>
                </button>
              );
            })}
          </div>

          <HeroPreviewInsights productId="insights" showDonut />
          <PreviewActivityStrip
            activeIndex={feedIndex}
            reduced={reduced}
            onPick={(i) => {
              setFeedIndex(i);
              tileCarousel.pause();
            }}
          />
        </>
      )}

      {view === "modules" && (
        <>
          <div className="mk-preview-modules mk-preview-modules--suite" aria-label="All PulsePoint modules">
            {HERO_PREVIEW_TILES.map((tile, i) => (
              <PreviewTile
                key={tile.id}
                tile={tile}
                delayMs={120 + i * 25}
                spotlight={!reduced && tileIndex === i}
                onSelect={() => pickTile(i)}
              />
            ))}
          </div>
          {activeTile ? (
            <p className="mk-preview-spotlight-copy">
              <strong>{activeTile.module}</strong> — {activeTile.subtitle}
            </p>
          ) : null}
        </>
      )}

      {view === "revenue" && (
        <>
          <MembershipMixStrip />
          <HeroPreviewInsights productId="insights" showDonut={false} />
        </>
      )}

      <p className="mk-preview-disclaimer">Illustrative preview · not your association&apos;s data</p>
    </div>
  );
}
