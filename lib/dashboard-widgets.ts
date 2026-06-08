/**
 * Dashboard widget catalog — drag-and-drop Insights builder.
 */

export type DashboardWidget = {
  id: string;
  metricKey: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const WIDGET_CATALOG: { metricKey: string; title: string; w: number; h: number }[] = [
  { metricKey: "revenue.total", title: "Total revenue", w: 2, h: 1 },
  { metricKey: "revenue.dues", title: "Dues revenue", w: 1, h: 1 },
  { metricKey: "revenue.non_dues", title: "Non-dues revenue", w: 1, h: 1 },
  { metricKey: "members.active", title: "Active members", w: 1, h: 1 },
  { metricKey: "members.at_risk", title: "At-risk members", w: 1, h: 1 },
  { metricKey: "events.registrations", title: "Event registrations", w: 1, h: 1 },
  { metricKey: "events.published", title: "Published events", w: 1, h: 1 },
  { metricKey: "revenue.giving", title: "Fundraising", w: 1, h: 1 },
  { metricKey: "revenue.commerce", title: "Commerce", w: 1, h: 1 },
];

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = WIDGET_CATALOG.slice(0, 6).map(
  (w, i) => ({
    id: `w${i + 1}`,
    metricKey: w.metricKey,
    title: w.title,
    x: (i % 3) * 2,
    y: Math.floor(i / 3),
    w: w.w,
    h: w.h,
  }),
);
