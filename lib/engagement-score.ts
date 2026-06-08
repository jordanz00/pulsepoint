/**
 * Member engagement scoring — derives score + tier from real tenant activity.
 *
 * WHO THIS IS FOR: Staff CRM views, Engage audience filters, Insights KPIs.
 * WHAT IT DOES: Counts registrations, orders, donations, CE, email sends → 0–100 score.
 * HOW IT CONNECTS: member detail 360, members/engagement page, recomputeEngagement action.
 */

export type EngagementTier = "active" | "moderate" | "at_risk" | "inactive";

export type EngagementSignals = {
  eventRegistrations: number;
  paidEventRegistrations: number;
  commerceOrders: number;
  paidCommerceOrders: number;
  donations: number;
  ceCredits: number;
  courseCompletions: number;
  emailSends: number;
  daysSinceJoin: number;
  daysUntilRenewal: number | null;
  status: "ACTIVE" | "INACTIVE" | "LAPSED";
};

const WEIGHTS = {
  eventReg: 8,
  paidEvent: 12,
  commerce: 10,
  donation: 15,
  ceCredit: 6,
  courseComplete: 10,
  email: 3,
} as const;

export function scoreFromSignals(s: EngagementSignals): { score: number; tier: EngagementTier } {
  if (s.status === "LAPSED" || s.status === "INACTIVE") {
    return { score: Math.min(15, s.donations * WEIGHTS.donation), tier: "inactive" };
  }

  let raw =
    s.eventRegistrations * WEIGHTS.eventReg +
    s.paidEventRegistrations * WEIGHTS.paidEvent +
    s.commerceOrders * WEIGHTS.commerce +
    s.paidCommerceOrders * WEIGHTS.commerce +
    s.donations * WEIGHTS.donation +
    s.ceCredits * WEIGHTS.ceCredit +
    s.courseCompletions * WEIGHTS.courseComplete +
    Math.min(s.emailSends, 5) * WEIGHTS.email;

  if (s.daysUntilRenewal !== null && s.daysUntilRenewal <= 30 && s.daysUntilRenewal >= 0) {
    raw -= 10;
  }
  if (s.daysSinceJoin <= 90) {
    raw += 5;
  }

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const tier = tierFromScore(score, s.daysUntilRenewal);
  return { score, tier };
}

export function tierFromScore(score: number, daysUntilRenewal: number | null): EngagementTier {
  if (daysUntilRenewal !== null && daysUntilRenewal < 0) return "at_risk";
  if (score >= 60) return "active";
  if (score >= 30) return "moderate";
  if (score >= 10) return "at_risk";
  return "inactive";
}

export const ENGAGEMENT_TIER_LABEL: Record<EngagementTier, string> = {
  active: "Active participant",
  moderate: "Moderately engaged",
  at_risk: "At risk",
  inactive: "Inactive",
};

export const BADGE_RULES: { code: string; label: string; minScore: number }[] = [
  { code: "champion", label: "Engagement champion", minScore: 75 },
  { code: "event-regular", label: "Event regular", minScore: 45 },
  { code: "donor", label: "Supporter", minScore: 35 },
  { code: "learner", label: "Lifelong learner", minScore: 25 },
];

export function badgesForScore(score: number): { code: string; label: string }[] {
  return BADGE_RULES.filter((b) => score >= b.minScore).map(({ code, label }) => ({ code, label }));
}
