/**
 * Dashboard topic colors — semantic coding for CEO overview (liquid-glass compatible).
 * Visual tokens: `--pp-topic-*-fg` in `app/pulse-surfaces.css` (six distinct hues).
 */

export type DashboardTopic =
  | "finance"
  | "members"
  | "events"
  | "engagement"
  | "attention"
  | "activity";

export const DASHBOARD_TOPIC_LEGEND: ReadonlyArray<{ topic: DashboardTopic; label: string }> = [
  { topic: "finance", label: "Financial" },
  { topic: "members", label: "Membership" },
  { topic: "events", label: "Programs & events" },
  { topic: "engagement", label: "Engagement" },
  { topic: "attention", label: "Needs attention" },
  { topic: "activity", label: "Activity & updates" },
];

/** Map executive KPI id → topic for glass card accents */
export function kpiTopic(id: string): DashboardTopic {
  if (id.startsWith("revenue")) return "finance";
  if (id.includes("at_risk") || id.includes("lapsed") || id.includes("renewal")) return "attention";
  if (id.startsWith("members")) return "members";
  if (id.startsWith("events")) return "events";
  return "activity";
}

/** Revenue breakdown line id → topic */
export function revenueLineTopic(id: string): DashboardTopic {
  if (id === "events") return "events";
  if (id === "dues") return "members";
  return "finance";
}

export function activityKindTopic(kind: "member" | "import" | "exception"): DashboardTopic {
  if (kind === "exception") return "attention";
  if (kind === "import") return "activity";
  return "members";
}

export function topicCardClass(topic: DashboardTopic): string {
  return `pp-topic-card pp-topic-card--${topic}`;
}
