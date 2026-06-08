"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";
import type { EngagementTier } from "@/lib/engagement-score";
import { EngagementTierViz } from "./engagement-tier-viz";

type TierCount = { tier: EngagementTier; count: number };

type EngagementMetricsClientProps = {
  tierCounts: TierCount[];
  totalActive: number;
  overallScore: number;
  sequencesRunning: number;
  emailsSentThisMonth: number;
};

function scoreTone(score: number): "strong" | "steady" | "watch" {
  if (score >= 60) return "strong";
  if (score >= 30) return "steady";
  return "watch";
}

export function EngagementMetricsClient({
  tierCounts,
  totalActive,
  overallScore,
  sequencesRunning,
  emailsSentThisMonth,
}: EngagementMetricsClientProps) {
  const tone = scoreTone(overallScore);

  return (
    <div className="pp-engagement-glass pp-topic-card pp-topic-card--engagement glass pp-glass-surface">
      <div className="pp-engagement-glass-grid">
        <div className={`pp-engagement-glass-score pp-engagement-glass-score--${tone}`}>
          <p className="pp-engagement-glass-eyebrow">Overall score</p>
          <p className="pp-engagement-glass-value" aria-live="polite">
            <AnimatedNumber value={overallScore} />
            <span className="pp-engagement-glass-suffix">/100</span>
          </p>
          <p className="pp-engagement-glass-caption">
            Weighted across active member tiers
          </p>
        </div>

        <EngagementTierViz tierCounts={tierCounts} totalActive={totalActive} />

        <div className="pp-engagement-glass-kpis">
          <article className="pp-engagement-glass-kpi">
            <p className="pp-engagement-glass-kpi-value">
              <AnimatedNumber value={sequencesRunning} />
            </p>
            <p className="pp-engagement-glass-kpi-label">Sequences running</p>
          </article>
          <article className="pp-engagement-glass-kpi">
            <p className="pp-engagement-glass-kpi-value">
              <AnimatedNumber value={emailsSentThisMonth} />
            </p>
            <p className="pp-engagement-glass-kpi-label">Emails this month</p>
          </article>
        </div>
      </div>
    </div>
  );
}
