import type { Deal } from "@/app/generated/prisma/client";

export type DealReportFilters = {
  pipelineId?: string;
  assigneeId?: string;
  /** Partial match on assignee display name */
  assigneeName?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function mergeFilters(
  dashboard: DealReportFilters,
  widget: DealReportFilters,
): DealReportFilters {
  return { ...dashboard, ...widget };
}

export function filterDeals(deals: Deal[], filters: DealReportFilters): Deal[] {
  return deals.filter((d) => {
    if (filters.pipelineId && d.pipelineId !== filters.pipelineId) return false;
    if (filters.assigneeId && d.assigneeId !== filters.assigneeId) return false;
    if (
      filters.assigneeName &&
      !d.assigneeName.toLowerCase().includes(filters.assigneeName.toLowerCase())
    ) {
      return false;
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (d.createdAt < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      if (d.createdAt > to) return false;
    }
    return true;
  });
}

export function parseFilters(json: unknown): DealReportFilters {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  return {
    pipelineId: typeof o.pipelineId === "string" ? o.pipelineId : undefined,
    assigneeId: typeof o.assigneeId === "string" ? o.assigneeId : undefined,
    assigneeName: typeof o.assigneeName === "string" ? o.assigneeName : undefined,
    dateFrom: typeof o.dateFrom === "string" ? o.dateFrom : undefined,
    dateTo: typeof o.dateTo === "string" ? o.dateTo : undefined,
  };
}
