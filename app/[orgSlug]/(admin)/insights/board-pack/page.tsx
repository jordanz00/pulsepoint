import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { getExecutiveDashboard } from "@/app/actions/insights";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { buildExecutiveBrief } from "@/lib/copilot/executive-brief";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ExecutiveKpiStrip } from "@/components/admin/executive-kpi-strip";
import { ExecutiveBriefing } from "@/components/copilot/executive-briefing";
import { OverviewChartsPanel } from "@/components/admin/overview-charts-panel";
import { BoardPackActions } from "@/components/insights/board-pack-actions";
import { loadOverviewCharts } from "@/lib/overview-dashboard-data";
import { loadDashboardPeriodDeltas } from "@/lib/dashboard-glass";

export const dynamic = "force-dynamic";

export default async function BoardPackPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [dashboard, briefSource, charts, periodDeltas] = await Promise.all([
    getExecutiveDashboard(orgSlug),
    loadExecutiveDashboard(org.id),
    loadOverviewCharts(org.id),
    loadDashboardPeriodDeltas(org.id),
  ]);
  const brief = buildExecutiveBrief(briefSource);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Board briefing pack"
        subtitle="Beautiful, printable executive report — live KPIs and narrative from your association data."
        badge="alpha"
        backHref={`/${orgSlug}/insights`}
        backLabel="Insights"
        actions={
          <BoardPackActions
            orgName={org.name}
            orgSlug={orgSlug}
            dashboard={briefSource}
            brief={brief}
            charts={{
              revenueTrend: charts.revenueTrend,
              duesPct: charts.duesPct,
              nonDuesPct: charts.nonDuesPct,
            }}
            deltas={{
              "revenue.total": periodDeltas.revenue,
              "members.active": periodDeltas.members,
              "revenue.non_dues": periodDeltas.nonDuesShare,
            }}
          />
        }
      />

      <div className="pp-board-pack pp-route-enter space-y-8 mt-6">
        <p className="text-sm text-[var(--fg-muted)]">
          Designed for board packets and leadership email — not a raw CSV dump. Use Print to save as PDF.
        </p>
        <ExecutiveKpiStrip
          kpis={dashboard.kpis}
          deltas={{
            "revenue.total": periodDeltas.revenue,
            "members.active": periodDeltas.members,
            "revenue.non_dues": periodDeltas.nonDuesShare,
          }}
          includeIds={["revenue.total", "members.active", "revenue.non_dues", "members.at_risk"]}
          hero
        />
        <OverviewChartsPanel
          revenueTrend={charts.revenueTrend}
          duesPct={charts.duesPct}
          nonDuesPct={charts.nonDuesPct}
        />
        <ExecutiveBriefing orgSlug={orgSlug} variant="home" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/${orgSlug}/insights`} className="pc-btn-secondary">
          Back to Insights
        </Link>
        <Link href={`/${orgSlug}/advocacy/issues/nursing-workforce`} className="pc-btn-secondary">
          Sample advocacy story
        </Link>
      </div>
    </AdminPage>
  );
}
