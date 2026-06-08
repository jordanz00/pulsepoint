import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { DealDashboardView } from "@/components/deals/deal-dashboard-view";
import { getDealReportDashboard } from "@/app/actions/deal-reports";
import { getOrgDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DealReportDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string; dashboardId: string }>;
}) {
  const { orgSlug, dashboardId } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const res = await getDealReportDashboard(orgSlug, dashboardId);
  if (!res.ok) notFound();

  const db = getOrgDb(org.id);
  const [deals, reasons] = await Promise.all([
    db.deal.findMany(),
    db.dealLossReason.findMany(),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={res.data.name}
        subtitle={res.data.description || "Partnership analytics dashboard"}
        badge="alpha"
        backHref={`/${orgSlug}/deals/reports`}
        backLabel="Reports"
      />
      <DealDashboardView
        orgSlug={orgSlug}
        dashboardId={dashboardId}
        initial={res.data}
        pipelines={res.pipelines}
        dealsJson={JSON.stringify(deals)}
        reasonLabelsJson={JSON.stringify([...reasons.map((r) => [r.id, r.label] as const)])}
      />
    </AdminPage>
  );
}
