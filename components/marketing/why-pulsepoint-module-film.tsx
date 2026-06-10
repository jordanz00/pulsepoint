"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { WHAT_MAKES_IT_DIFFERENT } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";
import { PRODUCT_MARKETING_ICONS } from "@/lib/suite-marketing";

const ROTATE_MS = 7000;

type Offer = (typeof WHAT_MAKES_IT_DIFFERENT.offers)[number];
type OfferId = Offer["id"];

function ModulePreviewFrame({ offer }: { offer: Offer }) {
  const pid = offer.productId as ProductId;

  if (offer.id === "members") {
    return (
      <div className="pp-flagship-frame pp-flagship-frame--members" style={moduleCssVars(pid)}>
        <div className="pp-flagship-frame-toolbar">
          <span className="badge-live">Live</span>
          <span>MemberCore · statewide roster</span>
        </div>
        <div className="pp-flagship-frame-search">Search hospitals, executives, PAC contacts…</div>
        <ul className="pp-flagship-frame-rows">
          <li>
            <strong>Regional Medical Center</strong>
            <span>Engagement 82 · Renewal current</span>
          </li>
          <li>
            <strong>Valley Community Hospital</strong>
            <span>Engagement 64 · Due soon</span>
          </li>
          <li>
            <strong>St. Mary&apos;s Health</strong>
            <span>Engagement 91 · PAC donor</span>
          </li>
        </ul>
      </div>
    );
  }

  if (offer.id === "advocacy") {
    return (
      <div className="pp-flagship-frame pp-flagship-frame--advocacy" style={moduleCssVars(pid)}>
        <div className="pp-flagship-frame-toolbar">
          <span className="badge-live">Live</span>
          <span>Advocacy · take-action</span>
        </div>
        <p className="pp-flagship-frame-issue-title">Hospital workforce sustainability</p>
        <p className="pp-flagship-frame-issue-meta">S.B. 1240 · 428 responses · 72% of roster engaged</p>
        <div className="pp-flagship-frame-progress">
          <span style={{ width: "72%" }} />
        </div>
        <p className="pp-flagship-frame-foot">See which hospitals have not signed on—no side spreadsheet.</p>
      </div>
    );
  }

  if (offer.id === "events") {
    return (
      <div className="pp-flagship-frame pp-flagship-frame--events" style={moduleCssVars(pid)}>
        <div className="pp-flagship-frame-toolbar">
          <span className="badge-live">Live</span>
          <span>EventCore · annual conference</span>
        </div>
        <p className="pp-flagship-frame-issue-title">Annual Leadership Summit</p>
        <p className="pp-flagship-frame-issue-meta">312 registered · check-in open · Stripe receipts</p>
        <div className="pp-flagship-frame-kpi-row">
          <div>
            <strong>94%</strong>
            <span>capacity</span>
          </div>
          <div>
            <strong>$48K</strong>
            <span>revenue</span>
          </div>
        </div>
      </div>
    );
  }

  if (offer.id === "insights") {
    return (
      <div className="pp-flagship-frame pp-flagship-frame--insights" style={moduleCssVars(pid)}>
        <div className="pp-flagship-frame-toolbar">
          <span className="badge-live">Live</span>
          <span>Insights · board deck</span>
        </div>
        <div className="pp-flagship-frame-kpi-row pp-flagship-frame-kpi-row--wide">
          <div>
            <strong>$284K</strong>
            <span>revenue MTD</span>
          </div>
          <div>
            <strong>94%</strong>
            <span>renewal health</span>
          </div>
          <div>
            <strong>12</strong>
            <span>programs</span>
          </div>
        </div>
        <p className="pp-flagship-frame-foot">Same totals staff use daily—export for Power BI.</p>
      </div>
    );
  }

  if (offer.id === "pac") {
    return (
      <div className="pp-flagship-frame pp-flagship-frame--pac" style={moduleCssVars(pid)}>
        <div className="pp-flagship-frame-toolbar">
          <span className="badge-alpha">Preview</span>
          <span>Hospital PAC · goal tracker</span>
        </div>
        <p className="pp-flagship-frame-issue-title">2026 PAC goal</p>
        <div className="pp-flagship-frame-progress pp-flagship-frame-progress--pac">
          <span style={{ width: "74%" }} />
        </div>
        <p className="pp-flagship-frame-issue-meta">74% of goal · linked to member roster</p>
      </div>
    );
  }

  return (
    <div className="pp-flagship-frame pp-flagship-frame--stack" style={moduleCssVars(pid)}>
      <div className="pp-flagship-frame-toolbar">
        <span className="badge-live">Live</span>
        <span>Integrations</span>
      </div>
      <ul className="pp-flagship-frame-stack-list">
        <li>Microsoft Entra sign-in</li>
        <li>EasyDNN HTML export</li>
        <li>Stripe receipts</li>
        <li>CSV roster import</li>
      </ul>
      <p className="pp-flagship-frame-foot">Your stack stays. PulsePoint plugs in.</p>
    </div>
  );
}

export function WhyPulsePointModuleFilm() {
  const offers = WHAT_MAKES_IT_DIFFERENT.offers.filter((o) => o.bento !== "strip");
  const reduced = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState<OfferId>(offers[0]?.id ?? "members");
  const [paused, setPaused] = useState(false);

  const activeOffer = offers.find((o) => o.id === activeId) ?? offers[0]!;

  const pick = useCallback((id: OfferId) => setActiveId(id), []);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setActiveId((current) => {
        const idx = offers.findIndex((o) => o.id === current);
        return offers[(idx + 1) % offers.length]!.id;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [offers, paused, reduced]);

  return (
    <div
      className="pp-flagship-film"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="pp-flagship-film-rail" role="tablist" aria-label="Platform modules">
        {offers.map((offer) => {
          const isActive = offer.id === activeId;
          return (
            <button
              key={offer.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`pp-flagship-film-tab${isActive ? " is-active" : ""}`}
              style={isActive ? moduleCssVars(offer.productId as ProductId) : undefined}
              onClick={() => pick(offer.id)}
            >
              <FeatureIcon
                icon={PRODUCT_MARKETING_ICONS[offer.productId]}
                productId={offer.productId}
                size="sm"
              />
              <span className="pp-flagship-film-tab-copy">
                <span className="pp-flagship-film-tab-title">{offer.title}</span>
                <span className="pp-flagship-film-tab-stat">
                  <AnimatedNumber
                    value={offer.statValue}
                    prefix={"statPrefix" in offer ? offer.statPrefix ?? "" : ""}
                    suffix={"statSuffix" in offer ? offer.statSuffix ?? "" : ""}
                  />{" "}
                  {offer.statLabel}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="pp-flagship-film-stage mk-liquid-glass" style={moduleCssVars(activeOffer.productId as ProductId)}>
        <div className="pp-flagship-film-stage-head">
          <h4>{activeOffer.title}</h4>
          <p>{activeOffer.body}</p>
        </div>
        <ModulePreviewFrame offer={activeOffer} />
        <div className="pp-flagship-film-stage-foot">
          <Link href="/demo" className="pc-btn-primary !rounded-full px-6 text-sm">
            Try {activeOffer.title} in demo
          </Link>
        </div>
      </div>
    </div>
  );
}
