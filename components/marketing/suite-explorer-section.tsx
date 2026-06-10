"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { MarketingSectionHeader } from "@/components/marketing/marketing-section-header";
import { StatusPill } from "@/components/marketing/status-pill";
import { SuiteExplorerPreview } from "@/components/marketing/suite-explorer-preview";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { moduleCssVars } from "@/lib/module-colors";
import {
  SUITE_EXPLORER_INTRO,
  SUITE_EXPLORER_TABS,
  type SuiteExplorerTab,
} from "@/lib/suite-explorer";
import type { ProductId } from "@/lib/products";

const ROTATE_MS = 8000;

export function SuiteExplorerSection() {
  const tabs = SUITE_EXPLORER_TABS;
  const reduced = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState(tabs[0]!.id);
  const [paused, setPaused] = useState(false);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]!;

  const pick = useCallback((id: string) => setActiveId(id), []);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setActiveId((current) => {
        const idx = tabs.findIndex((t) => t.id === current);
        return tabs[(idx + 1) % tabs.length]!.id;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, tabs]);

  return (
    <section
      id="features"
      className="pp-suite-explorer mk-section scroll-mt-24"
      aria-labelledby="pp-suite-explorer-title"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-suite-explorer-aurora" aria-hidden />
      <div className="mk-container pp-suite-explorer-inner">
        <RevealOnView>
          <MarketingSectionHeader
            titleId="pp-suite-explorer-title"
            eyebrow={SUITE_EXPLORER_INTRO.eyebrow}
            title={SUITE_EXPLORER_INTRO.title}
            lead={SUITE_EXPLORER_INTRO.lead}
          />
        </RevealOnView>

        <div
          className="pp-suite-explorer-stage"
          onMouseEnter={() => setPaused(true)}
        >
          <div
            className="pp-suite-explorer-tabs"
            role="tablist"
            aria-label="Platform modules"
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeId}
                onPick={() => pick(tab.id)}
              />
            ))}
          </div>

          <div className="pp-suite-explorer-panel">
            <div
              className="pp-suite-explorer-copy"
              style={moduleCssVars(active.productId as ProductId)}
            >
              <div className="pp-suite-explorer-copy-head">
                <FeatureIcon
                  icon={active.icon}
                  productId={active.productId as ProductId}
                  size="lg"
                />
                <StatusPill status={active.status} />
              </div>
              <h3 className="pp-suite-explorer-headline">{active.headline}</h3>
              <p className="pp-suite-explorer-pitch">{active.pitch}</p>
              <ul className="pp-suite-explorer-bullets">
                {active.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link
                href={active.demoHref}
                className="btn-primary pp-suite-explorer-cta !rounded-full"
              >
                {active.demoLabel}
              </Link>
            </div>

            <RevealOnView delayMs={60} className="pp-suite-explorer-preview-wrap">
              <div
                className="pp-suite-explorer-preview-frame"
                style={moduleCssVars(active.productId as ProductId)}
                key={active.id}
              >
                <SuiteExplorerPreview
                  preview={active.preview}
                  demoHref={active.demoHref}
                  vizProductId={active.vizProductId}
                />
              </div>
            </RevealOnView>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  tab,
  isActive,
  onPick,
}: {
  tab: SuiteExplorerTab;
  isActive: boolean;
  onPick: () => void;
}) {
  const statusLabel =
    tab.status === "available" ? "Live" : tab.status === "alpha" ? "Preview" : "Soon";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`pp-suite-explorer-tab${isActive ? " is-active" : ""}`}
      style={moduleCssVars(tab.productId as ProductId)}
      onClick={onPick}
      onFocus={onPick}
    >
      <FeatureIcon icon={tab.icon} productId={tab.productId as ProductId} size="sm" />
      <span className="pp-suite-explorer-tab-label">{tab.label}</span>
      <span className="pp-suite-explorer-tab-status">{statusLabel}</span>
    </button>
  );
}
