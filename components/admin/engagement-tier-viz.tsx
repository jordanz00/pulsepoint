"use client";

import type { CSSProperties } from "react";
import type { EngagementTier } from "@/lib/engagement-score";
import { ENGAGEMENT_TIER_LABEL } from "@/lib/engagement-score";

export type TierSlice = { tier: EngagementTier; count: number };

const TIER_STYLE: Record<
  EngagementTier,
  { color: string; tint: string; label: string }
> = {
  active: {
    color: "var(--pp-tier-active)",
    tint: "var(--pp-tier-active-bg)",
    label: ENGAGEMENT_TIER_LABEL.active,
  },
  moderate: {
    color: "var(--pp-tier-moderate)",
    tint: "var(--pp-tier-moderate-bg)",
    label: ENGAGEMENT_TIER_LABEL.moderate,
  },
  at_risk: {
    color: "var(--pp-tier-atrisk)",
    tint: "var(--pp-tier-atrisk-bg)",
    label: ENGAGEMENT_TIER_LABEL.at_risk,
  },
  inactive: {
    color: "var(--pp-tier-inactive)",
    tint: "var(--pp-tier-inactive-bg)",
    label: ENGAGEMENT_TIER_LABEL.inactive,
  },
};

/**
 * Compact liquid-glass tier graphic — stacked bar + soft orbs (no pie/donut).
 */
export function EngagementTierViz({
  tierCounts,
  totalActive,
}: {
  tierCounts: TierSlice[];
  totalActive: number;
}) {
  return (
    <div
      className="pp-engagement-tier-viz"
      role="img"
      aria-label="Member engagement tier breakdown"
    >
      <svg className="pp-engagement-tier-viz-orbs" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <radialGradient id="pp-eng-orb-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196, 92, 138, 0.35)" />
            <stop offset="100%" stopColor="rgba(196, 92, 138, 0)" />
          </radialGradient>
          <radialGradient id="pp-eng-orb-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(29, 158, 117, 0.28)" />
            <stop offset="100%" stopColor="rgba(29, 158, 117, 0)" />
          </radialGradient>
          <radialGradient id="pp-eng-orb-c" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(91, 141, 239, 0.22)" />
            <stop offset="100%" stopColor="rgba(91, 141, 239, 0)" />
          </radialGradient>
        </defs>
        <circle cx="88" cy="32" r="36" fill="url(#pp-eng-orb-a)" />
        <circle cx="34" cy="78" r="28" fill="url(#pp-eng-orb-b)" />
        <circle cx="72" cy="88" r="22" fill="url(#pp-eng-orb-c)" />
      </svg>

      <div className="pp-engagement-tier-viz-body">
        <p className="pp-engagement-tier-viz-label">
          {totalActive.toLocaleString()} active · by tier
        </p>
        <div className="pp-engagement-tier-viz-track" aria-hidden>
          {tierCounts.map(({ tier, count }) => {
            const pct = totalActive > 0 ? (count / totalActive) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={tier}
                className="pp-engagement-tier-viz-seg"
                style={{
                  width: `${pct}%`,
                  background: TIER_STYLE[tier].color,
                }}
                title={`${TIER_STYLE[tier].label}: ${count}`}
              />
            );
          })}
        </div>
        <ul className="pp-engagement-tier-viz-pills">
          {tierCounts.map(({ tier, count }) => {
            const pct = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
            return (
              <li
                key={tier}
                className="pp-engagement-tier-viz-pill"
                style={
                  {
                    "--pill-color": TIER_STYLE[tier].color,
                    "--pill-tint": TIER_STYLE[tier].tint,
                  } as CSSProperties
                }
              >
                <span className="pp-engagement-tier-viz-pill-dot" aria-hidden />
                <span className="pp-engagement-tier-viz-pill-name">{TIER_STYLE[tier].label}</span>
                <span className="pp-engagement-tier-viz-pill-meta">
                  {count.toLocaleString()} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
