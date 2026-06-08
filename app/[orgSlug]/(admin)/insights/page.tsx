import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { getExecutiveDashboard } from "@/app/actions/insights";
import { loadInsightsTrends } from "@/lib/insights-trends";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ExecutiveDashboard } from "@/components/insights/executive-dashboard";
import { InsightsSnapshotButton } from "@/components/insights/insights-snapshot-button";
import { InsightsTrendPanel } from "@/components/insights/insights-trend-panel";
import { ReportSchedulePanel } from "@/components/insights/report-schedule-panel";
import { ADMIN_PAGES, pageSubtitle } from "@/lib/admin-page-copy";
import { getDashboardLayout } from "@/app/actions/dashboard";
import { DashboardBuilder } from "@/components/insights/dashboard-builder";
import { PowerBiExportCta } from "@/components/insights/power-bi-export-cta";
import { ExecutiveBriefing } from "@/components/copilot/executive-briefing";
import { InsightsFeed } from "@/components/intelligence/insights-feed";
import { DashboardTopicLegend } from "@/components/admin/dashboard-topic-legend";
import { OverviewChartsPanel } from "@/components/admin/overview-charts-panel";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { HospitalAssociationStrip } from "@/components/enterprise/hospital-association-strip";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { loadOverviewCharts } from "@/lib/overview-dashboard-data";

export const dynamic = "force-dynamic";

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [data, schedules, widgets, trends, charts] = await Promise.all([
    getExecutiveDashboard(orgSlug),
    (async () => {
      const db = getOrgDb(org.id);
      return db.reportSchedule.findMany({
        where: { orgId: org.id },
        orderBy: { createdAt: "desc" },
      });
    })(),
    getDashboardLayout(orgSlug),
    loadInsightsTrends(org.id),
    loadOverviewCharts(org.id),
  ]);

  const kpiValues = Object.fromEntries(data.kpis.map((k) => [k.id, k.value]));

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={ADMIN_PAGES.insights.title}
        subtitle={pageSubtitle(orgSlug, "insights")}
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
        actions={
          <>
            <Link href={`/${orgSlug}/insights/board-pack`} className="pc-btn-primary text-sm">
              Board pack
            </Link>
            <InsightsSnapshotButton orgSlug={orgSlug} />
          </>
        }
      />
      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="insights" />
      <PowerBiExportCta orgSlug={orgSlug} />
      <div className="mt-6">
        <HospitalAssociationStrip orgId={org.id} orgSlug={orgSlug} variant="compact" />
      </div>
      <DashboardTopicLegend className="mt-6" />
      <div className="mt-6">
        <OverviewChartsPanel
          revenueTrend={charts.revenueTrend}
          duesPct={charts.duesPct}
          nonDuesPct={charts.nonDuesPct}
        />
      </div>
      <div className="mt-8 space-y-8">
        <InsightsFeed orgSlug={orgSlug} limit={4} showViewAll />
        <ExecutiveBriefing orgSlug={orgSlug} />
      </div>
      <ExecutiveDashboard data={data} orgSlug={orgSlug} />
      <div className="mt-10">
        <InsightsTrendPanel trends={trends} />
      </div>
      <DashboardBuilder orgSlug={orgSlug} initialWidgets={widgets} kpiValues={kpiValues} />
      <ReportSchedulePanel orgSlug={orgSlug} schedules={schedules} />
    </AdminPage>
  );
}
