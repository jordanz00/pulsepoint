/**
 * Illustrative chart series for marketing previews — not live org metrics.
 * Label all UI that uses these as sample / illustrative.
 */

export type ChartPoint = {
  label: string;
  value: number;
};

/** Six-month revenue trend (USD thousands) — demo storytelling only */
export const SAMPLE_REVENUE_TREND: ChartPoint[] = [
  { label: "Oct", value: 186 },
  { label: "Nov", value: 212 },
  { label: "Dec", value: 198 },
  { label: "Jan", value: 245 },
  { label: "Feb", value: 268 },
  { label: "Mar", value: 284 },
];

export const SAMPLE_REVENUE_BREAKDOWN = [
  { id: "dues", label: "Membership dues", pct: 72, color: "var(--icon-learn)" },
  { id: "events", label: "Event registrations", pct: 48, color: "var(--icon-insights)" },
  { id: "giving", label: "Fundraising", pct: 35, color: "var(--icon-giving)" },
  { id: "commerce", label: "Commerce", pct: 28, color: "var(--icon-commerce)" },
] as const;

export const SAMPLE_DONUT = [
  { name: "Dues", value: 62, color: "#0072bc" },
  { name: "Non-dues", value: 38, color: "#1d9e75" },
] as const;
