/**
 * AMS Intelligence Layer — typed insight contract (live data only, no LLM).
 */

export type InsightDomain =
  | "membership"
  | "events"
  | "sponsorship"
  | "advocacy"
  | "committees"
  | "operations";

export type InsightPriority = "urgent" | "important" | "info";

export type OrgInsight = {
  id: string;
  domain: InsightDomain;
  priority: InsightPriority;
  /** One-line headline */
  title: string;
  /** One-line recommended action */
  action: string;
  href: string;
  metricValue?: number;
  metricLabel?: string;
};

export type OrgInsightsResult = {
  dataAsOf: Date;
  insights: OrgInsight[];
  /** Counts by priority for UI badges */
  counts: { urgent: number; important: number; info: number };
};

export const INSIGHT_PRIORITY_ORDER: Record<InsightPriority, number> = {
  urgent: 0,
  important: 1,
  info: 2,
};

export const INSIGHT_DOMAIN_LABELS: Record<InsightDomain, string> = {
  membership: "Membership",
  events: "Events",
  sponsorship: "Sponsorship",
  advocacy: "Advocacy",
  committees: "Committees",
  operations: "Operations",
};
