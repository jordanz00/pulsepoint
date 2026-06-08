"use server";

/**
 * Deal reports dashboards — Nimble-style multiple dashboards, widgets, filters.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { DEFAULT_REPORT_WIDGETS } from "@/lib/deals/constants";
import { mergeFilters, parseFilters, type DealReportFilters } from "@/lib/deals/report-filters";
import { computeReport } from "@/lib/deals/reports";
import type { DealReportDashboardView } from "@/lib/deals/report-views";
import type { ActionResult } from "@/app/actions/members";

function reportsBase(orgSlug: string) {
  return `/${orgSlug}/deals/reports`;
}

async function loadDealsContext(orgId: string) {
  const db = getOrgDb(orgId);
  const [deals, reasons, pipelines] = await Promise.all([
    db.deal.findMany(),
    db.dealLossReason.findMany({ orderBy: { sortOrder: "asc" } }),
    db.dealPipeline.findMany({ orderBy: { name: "asc" } }),
  ]);
  const reasonLabels = new Map(reasons.map((r) => [r.id, r.label]));
  return { deals, reasonLabels, pipelines };
}

function hydrateDashboard(
  dashboard: {
    id: string;
    name: string;
    description: string;
    visibility: string;
    isDefault: boolean;
    filters: unknown;
    widgets: Array<{
      id: string;
      reportType: string;
      chartType: string;
      title: string;
      sortOrder: number;
      filters: unknown;
    }>;
  },
  deals: Awaited<ReturnType<typeof loadDealsContext>>["deals"],
  reasonLabels: Map<string, string>,
  extraFilters?: DealReportFilters,
): DealReportDashboardView {
  const dashFilters = parseFilters(dashboard.filters);
  const mergedBase = extraFilters ? { ...dashFilters, ...extraFilters } : dashFilters;

  return {
    id: dashboard.id,
    name: dashboard.name,
    description: dashboard.description,
    visibility: dashboard.visibility,
    isDefault: dashboard.isDefault,
    filters: mergedBase,
    widgets: dashboard.widgets
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((w) => {
        const filters = mergeFilters(mergedBase, parseFilters(w.filters));
        return {
          id: w.id,
          reportType: w.reportType,
          chartType: w.chartType,
          title: w.title || w.reportType,
          sortOrder: w.sortOrder,
          filters,
          result: computeReport(w.reportType, deals, filters, reasonLabels),
        };
      }),
  };
}

export async function ensureDefaultDealReports(orgSlug?: string): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);

    let pipeline = await db.dealPipeline.findFirst({
      where: { isDefault: true },
    });
    if (!pipeline) {
      pipeline = await db.dealPipeline.create({
        data: {
          orgId: staff.orgId,
          name: "Sponsorship & partnerships",
          isDefault: true,
        },
      });
    }

    const reasonCount = await db.dealLossReason.count();
    if (reasonCount === 0) {
      const labels = ["Budget constraints", "Timing", "Chose competitor", "No decision"];
      for (let i = 0; i < labels.length; i++) {
        await db.dealLossReason.create({
          data: { orgId: staff.orgId, label: labels[i]!, sortOrder: i },
        });
      }
    }

    const dashCount = await db.dealReportDashboard.count();
    if (dashCount === 0) {
      const dashboard = await db.dealReportDashboard.create({
        data: {
          orgId: staff.orgId,
          name: "Sales performance",
          description: "Default deal analytics — filter by pipeline, rep, or date.",
          visibility: "TEAM",
          isDefault: true,
          filters: { pipelineId: pipeline.id } as Prisma.InputJsonValue,
          createdBy: staff.userId,
        },
      });

      for (let i = 0; i < DEFAULT_REPORT_WIDGETS.length; i++) {
        const w = DEFAULT_REPORT_WIDGETS[i]!;
        await db.dealReportWidget.create({
          data: {
            orgId: staff.orgId,
            dashboardId: dashboard.id,
            reportType: w.reportType,
            chartType: w.chartType,
            title: w.title,
            sortOrder: i,
            filters: {},
          },
        });
      }
    }

    revalidatePath(reportsBase(staff.orgSlug));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function listDealReportDashboards(orgSlug?: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await ensureDefaultDealReports(orgSlug);
    const dashboards = await db.dealReportDashboard.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: { widgets: true },
    });
    return { ok: true as const, data: dashboards };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function getDealReportDashboard(
  orgSlug: string,
  dashboardId: string,
  viewFilters?: DealReportFilters,
) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await ensureDefaultDealReports(orgSlug);

    const dashboard = await db.dealReportDashboard.findFirst({
      where: { id: dashboardId },
      include: { widgets: true },
    });
    if (!dashboard) return { ok: false as const, error: "Dashboard not found" };

    const ctx = await loadDealsContext(staff.orgId);
    return {
      ok: true as const,
      data: hydrateDashboard(dashboard, ctx.deals, ctx.reasonLabels, viewFilters),
      pipelines: ctx.pipelines,
    };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function createDealReportDashboard(
  orgSlug: string,
  input: { name: string; description?: string; visibility?: string },
): Promise<ActionResult & { dashboardId?: string }> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const dashboard = await db.dealReportDashboard.create({
      data: {
        orgId: staff.orgId,
        name: input.name.trim().slice(0, 120) || "Custom dashboard",
        description: (input.description ?? "").slice(0, 500),
        visibility: (input.visibility as "PRIVATE" | "TEAM" | "ORG") ?? "TEAM",
        filters: {},
        createdBy: staff.userId,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "deal_report.dashboard_created",
      entity: "DealReportDashboard",
      entityId: dashboard.id,
      diff: { name: dashboard.name },
    });

    revalidatePath(reportsBase(orgSlug));
    return { ok: true, dashboardId: dashboard.id };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateDealReportDashboard(
  orgSlug: string,
  dashboardId: string,
  input: {
    name?: string;
    description?: string;
    visibility?: string;
    filters?: DealReportFilters;
  },
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.dealReportDashboard.update({
      where: { id: dashboardId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim().slice(0, 120) } : {}),
        ...(input.description !== undefined
          ? { description: input.description.slice(0, 500) }
          : {}),
        ...(input.visibility
          ? { visibility: input.visibility as "PRIVATE" | "TEAM" | "ORG" }
          : {}),
        ...(input.filters !== undefined
          ? { filters: input.filters as Prisma.InputJsonValue }
          : {}),
      },
    });
    revalidatePath(`${reportsBase(orgSlug)}/${dashboardId}`);
    revalidatePath(`${reportsBase(orgSlug)}/${dashboardId}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function addDealReportWidget(
  orgSlug: string,
  dashboardId: string,
  input: { reportType: string; chartType?: string; title?: string },
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const max = await db.dealReportWidget.aggregate({
      where: { dashboardId },
      _max: { sortOrder: true },
    });
    await db.dealReportWidget.create({
      data: {
        orgId: staff.orgId,
        dashboardId,
        reportType: input.reportType as
          | "LOST_BY_STAGE"
          | "WON_OVER_TIME"
          | "LOST_BY_REASON"
          | "REVENUE_FORECAST"
          | "DEAL_CONVERSION"
          | "DEAL_PROGRESS"
          | "TEAM_LEADERBOARD",
        chartType: (input.chartType ?? "BAR") as "BAR" | "DONUT" | "TABLE",
        title: (input.title ?? "").slice(0, 120),
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        filters: {},
      },
    });
    revalidatePath(`${reportsBase(orgSlug)}/${dashboardId}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateDealReportWidget(
  orgSlug: string,
  widgetId: string,
  input: {
    title?: string;
    chartType?: string;
    filters?: DealReportFilters;
    sortOrder?: number;
  },
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.dealReportWidget.update({
      where: { id: widgetId },
      data: {
        ...(input.title !== undefined ? { title: input.title.slice(0, 120) } : {}),
        ...(input.chartType
          ? { chartType: input.chartType as "BAR" | "DONUT" | "TABLE" }
          : {}),
        ...(input.filters !== undefined
          ? { filters: input.filters as Prisma.InputJsonValue }
          : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
    revalidatePath(reportsBase(orgSlug));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteDealReportWidget(
  orgSlug: string,
  widgetId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.dealReportWidget.delete({ where: { id: widgetId } });
    revalidatePath(reportsBase(orgSlug));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function deleteDealReportDashboard(
  orgSlug: string,
  dashboardId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const target = await db.dealReportDashboard.findFirst({ where: { id: dashboardId } });
    if (!target) return { ok: false, error: "Dashboard not found" };
    if (target.isDefault) return { ok: false, error: "Cannot delete the default dashboard" };
    await db.dealReportDashboard.delete({ where: { id: dashboardId } });
    revalidatePath(reportsBase(orgSlug));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
