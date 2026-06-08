/**
 * Sample Insights preview data — executive revenue KPIs.
 */

export const INSIGHTS_PREVIEW_KPIS = [
  {
    id: "total",
    label: "Total revenue",
    value: 284,
    prefix: "$",
    suffix: "K",
    meta: "+8% vs prior month",
    productId: "insights" as const,
  },
  {
    id: "dues",
    label: "Dues",
    value: 176,
    prefix: "$",
    suffix: "K",
    meta: "62% of total",
    productId: "commerce" as const,
  },
  {
    id: "events",
    label: "Events",
    value: 68,
    prefix: "$",
    suffix: "K",
    meta: "Non-dues programs",
    productId: "events" as const,
  },
  {
    id: "giving",
    label: "Giving",
    value: 40,
    prefix: "$",
    suffix: "K",
    meta: "PAC + campaigns",
    productId: "giving" as const,
  },
] as const;

export const INSIGHTS_PREVIEW_LINES = [
  { id: "renewal", label: "Renewal rate", value: 94, suffix: "%", productId: "members" as const },
  { id: "risk", label: "At-risk facilities", value: 18, suffix: "", productId: "deals" as const },
  { id: "unpaid", label: "Unpaid dues", value: 24, prefix: "$", suffix: "K", productId: "commerce" as const },
] as const;
