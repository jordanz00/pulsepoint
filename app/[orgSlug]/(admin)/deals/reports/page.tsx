import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { CreateDashboardForm } from "@/components/deals/create-dashboard-form";
import { listDealReportDashboards } from "@/app/actions/deal-reports";

export const dynamic = "force-dynamic";

export default async function DealReportsIndexPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const res = await listDealReportDashboards(orgSlug);
  const dashboards = res.ok ? res.data : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Partnership analytics"
        subtitle="Multiple custom dashboards — filter by pipeline, rep, and date. View filters are temporary; edit mode saves permanent filters."
        badge="alpha"
        backHref={`/${orgSlug}/deals`}
        backLabel="Partnerships"
      />

      <div className="mb-8 pc-card p-4">
        <h2 className="pc-section-title mb-3">Create dashboard</h2>
        <CreateDashboardForm orgSlug={orgSlug} />
      </div>

      <ul className="space-y-3">
        {dashboards.map((d) => (
          <li key={d.id}>
            <Link
              href={`/${orgSlug}/deals/reports/${d.id}`}
              className="pc-glass-panel flex flex-wrap items-center justify-between gap-2 rounded-xl p-4 transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-zinc-900">
                  {d.name}
                  {d.isDefault ? (
                    <span className="ml-2 text-xs font-normal text-[var(--pc-brand)]">Default</span>
                  ) : null}
                </p>
                <p className="text-sm text-zinc-500">
                  {d.description || "No description"} · {d.widgets.length} widget
                  {d.widgets.length === 1 ? "" : "s"} · {d.visibility}
                </p>
              </div>
              <span className="text-sm font-medium text-[var(--pc-brand)]">View →</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
