/** Partnership pipeline + reports — executive analytics labels */

export const DEAL_STAGE_LABEL: Record<string, string> = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const ACTIVE_DEAL_STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"] as const;

export const DEAL_REPORT_LABEL: Record<string, string> = {
  LOST_BY_STAGE: "Lost by stage",
  WON_OVER_TIME: "Partnerships won over time",
  LOST_BY_REASON: "Partnerships lost by reason",
  REVENUE_FORECAST: "Revenue forecast",
  DEAL_CONVERSION: "Partnership conversion",
  DEAL_PROGRESS: "Pipeline progress by stage",
  TEAM_LEADERBOARD: "Team leaderboard",
};

export const DEFAULT_REPORT_WIDGETS = [
  { reportType: "DEAL_PROGRESS" as const, chartType: "BAR" as const, title: "Pipeline progress by stage" },
  { reportType: "WON_OVER_TIME" as const, chartType: "BAR" as const, title: "Partnerships won over time" },
  { reportType: "LOST_BY_STAGE" as const, chartType: "DONUT" as const, title: "Lost by stage" },
  { reportType: "LOST_BY_REASON" as const, chartType: "TABLE" as const, title: "Lost by reason" },
  { reportType: "REVENUE_FORECAST" as const, chartType: "BAR" as const, title: "Revenue forecast" },
  { reportType: "DEAL_CONVERSION" as const, chartType: "TABLE" as const, title: "Partnership conversion" },
  { reportType: "TEAM_LEADERBOARD" as const, chartType: "TABLE" as const, title: "Team leaderboard" },
];
