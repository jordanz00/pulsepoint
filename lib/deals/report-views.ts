/**
 * Deal report dashboard view types (client-safe — not a server actions file).
 */

import type { DealReportFilters } from "@/lib/deals/report-filters";
import type { computeReport } from "@/lib/deals/reports";

export type DealReportWidgetView = {
  id: string;
  reportType: string;
  chartType: string;
  title: string;
  sortOrder: number;
  filters: DealReportFilters;
  result: ReturnType<typeof computeReport>;
};

export type DealReportDashboardView = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  isDefault: boolean;
  filters: DealReportFilters;
  widgets: DealReportWidgetView[];
};
