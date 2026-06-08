import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { ensureDefaultCrmWorkflows, getCrmDashboard } from "@/app/actions/crm";

const LINKS = [
  { title: "Member directory", hrefSuffix: "members", external: true },
  { title: "Unify contacts", hrefSuffix: "unify", external: false },
  { title: "Prospector", hrefSuffix: "prospector", external: false },
  { title: "Workflows", hrefSuffix: "workflows", external: false },
  { title: "Web forms", hrefSuffix: "forms", external: false },
] as const;

export default async function CrmHubPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultCrmWorkflows(orgSlug);
  const dash = await getCrmDashboard(orgSlug);
  const stats = dash.ok ? dash.data : null;

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="CRM"
        subtitle="Contacts, workflows, and prospecting."
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="crm" />

      {stats ? (
        <div className="pp-module-stats glass">
          <div className="pp-module-stat">
            <span className="pp-module-stat-value">{stats.followUpsDue}</span>
            <span className="pp-module-stat-label">Follow-ups (7 days)</span>
          </div>
          <div className="pp-module-stat">
            <span className="pp-module-stat-value">{stats.atRiskCount}</span>
            <span className="pp-module-stat-label">At-risk</span>
          </div>
          <div className="pp-module-stat">
            <span className="pp-module-stat-value">{stats.activeWorkflows}</span>
            <span className="pp-module-stat-label">Active workflows</span>
          </div>
          <div className="pp-module-stat">
            <span className="pp-module-stat-value">{stats.duplicateGroups}</span>
            <span className="pp-module-stat-label">Duplicate groups</span>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((p) => (
          <li key={p.title}>
            <Link
              href={
                p.external ? `/${orgSlug}/${p.hrefSuffix}` : `/${orgSlug}/crm/${p.hrefSuffix}`
              }
              className="pc-card block transition hover:shadow-md"
            >
              <span className="font-semibold text-[var(--text-primary)]">{p.title}</span>
              <span className="mt-1 block text-sm text-[var(--text-muted)]">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
