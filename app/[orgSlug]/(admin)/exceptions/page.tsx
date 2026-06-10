import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { listOpenExceptions } from "@/app/actions/exceptions";
import { ResolveExceptionButton } from "@/components/exceptions/resolve-button";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { pageSubtitle } from "@/lib/admin-page-copy";
import { prisma } from "@/lib/prisma";
import { EnterpriseDataTable } from "@/components/enterprise/enterprise-data-table";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

export default async function ExceptionsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const result = await listOpenExceptions();
  const items = result.ok && result.data ? result.data.items : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Exceptions queue"
        subtitle={pageSubtitle(orgSlug, "exceptions")}
        backHref={`/${orgSlug}`}
        backLabel="Home"
        actions={
          <Link href={`/${orgSlug}/sync`} className="pc-btn-secondary text-sm">
            Sync center
          </Link>
        }
      />

      <div className="pp-module-stats glass mb-6">
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{items.length}</span>
          <span className="pp-module-stat-label">Open items</span>
        </div>
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{items.filter((i) => i.outcome === "FAILED").length}</span>
          <span className="pp-module-stat-label">Failed steps</span>
        </div>
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{items.filter((i) => i.workflow.includes("email")).length}</span>
          <span className="pp-module-stat-label">Email-related</span>
        </div>
      </div>

      <EnterpriseDataTable
        caption="Open exceptions"
        count={items.length}
        empty={
          <EnterpriseStatePanel
            variant="clear"
            title="Queue is clear"
            description="Automation exceptions appear here when a workflow step needs staff review."
          />
        }
      >
        <thead>
          <tr>
            <th scope="col">Workflow</th>
            <th scope="col">Step</th>
            <th scope="col">Outcome</th>
            <th scope="col">Message</th>
            <th scope="col">When</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td className="pp-data-table__primary">{row.workflow}</td>
              <td>{row.step}</td>
              <td>
                <span className={`pp-data-table__badge pp-data-table__badge--${row.outcome === "FAILED" ? "err" : "watch"}`}>
                  {row.outcome}
                </span>
              </td>
              <td className="pp-data-table__muted pp-data-table__truncate">{row.message}</td>
              <td className="pp-data-table__muted pp-data-table__nowrap">
                <time dateTime={row.createdAt.toISOString()}>
                  {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                </time>
              </td>
              <td className="pp-data-table__actions">
                <ResolveExceptionButton exceptionId={row.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </EnterpriseDataTable>
    </AdminPage>
  );
}
