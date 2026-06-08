"use client";

import { ENGAGEMENT_TIER_LABEL, type EngagementTier } from "@/lib/engagement-score";

const TIER_COLOR: Record<EngagementTier, string> = {
  active: "var(--pp-tier-active)",
  moderate: "var(--pp-tier-moderate)",
  at_risk: "var(--pp-tier-atrisk)",
  inactive: "var(--pp-tier-inactive)",
};

export function MemberPulseGauge({
  score,
  tier,
  size = "md",
  showLabel = true,
}: {
  score: number;
  tier: EngagementTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const dim = size === "lg" ? 88 : size === "md" ? 64 : 48;
  const stroke = size === "lg" ? 8 : 6;
  const r = (dim - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className={`pp-pulse-gauge pp-pulse-gauge--${tier} flex flex-col items-center gap-1`}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="var(--border-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke={TIER_COLOR[tier]}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-bold text-[var(--readable-on-light-fg)] ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}`}
        style={{ marginTop: -dim * 0.72 }}
      >
        {score}
      </span>
      {showLabel ? (
        <span className="text-xs text-[var(--readable-on-light-muted)]">
          {ENGAGEMENT_TIER_LABEL[tier]}
        </span>
      ) : null}
    </div>
  );
}

export function MemberPulseDimensionBar({
  label,
  score,
  accent,
}: {
  label: string;
  score: number;
  accent?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-[var(--readable-on-light-muted)]">{label}</span>
        <span className="font-medium text-[var(--readable-on-light-fg)]">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--border-muted)_35%,transparent)]">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${Math.max(4, score)}%`,
            backgroundColor: accent ?? "var(--accent-brand)",
          }}
        />
      </div>
    </div>
  );
}
