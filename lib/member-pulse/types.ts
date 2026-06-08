/**
 * MemberPulse — multi-dimensional engagement for association members.
 */

import type { EngagementTier } from "@/lib/engagement-score";

export const MEMBER_PULSE_DIMENSION_IDS = [
  "association",
  "comms",
  "advocacy",
  "board",
  "events",
] as const;

export type MemberPulseDimensionId = (typeof MEMBER_PULSE_DIMENSION_IDS)[number];

export type MemberPulseMetric = {
  key: string;
  label: string;
  value: number;
  unit?: string;
};

export type MemberPulseDimension = {
  id: MemberPulseDimensionId;
  label: string;
  score: number;
  tier: EngagementTier;
  summary: string;
  metrics: MemberPulseMetric[];
  highlights: string[];
};

export type MemberPulseSnapshot = {
  overall: number;
  overallTier: EngagementTier;
  dimensions: MemberPulseDimension[];
  computedAt: string;
};

export type MemberPulseOrgSummary = {
  averages: Record<MemberPulseDimensionId, number>;
  tierCounts: Record<EngagementTier, number>;
  totalMembers: number;
  topChampions: Array<{
    id: string;
    firstName: string;
    lastName: string;
    overall: number;
  }>;
};
