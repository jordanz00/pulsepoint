import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { listOpenExceptions } from "@/app/actions/exceptions";
import { ResolveExceptionButton } from "@/components/exceptions/resolve-button";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { pageSubtitle } from "@/lib/admin-page-copy";
import { prisma } from "@/lib/prisma";

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

      {items.length === 0 ? (
        <div className="pc-card pp-readable-on-light p-8 text-center">
          <p className="text-lg font-semibold text-[var(--readable-on-light-fg)]">Queue is clear</p>
          <p className="mt-2 text-sm text-[var(--readable-on-light-muted)]">
            Automation exceptions appear here when a workflow step needs staff review.
          </p>
        </div>
      ) : (
        <div className="pc-table-wrap pc-card">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Step</th>
                <th>Outcome</th>
                <th>Message</th>
                <th>When</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium">{row.workflow}</td>
                  <td>{row.step}</td>
                  <td>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      {row.outcome}
                    </span>
                  </td>
                  <td className="max-w-md text-sm text-[var(--text-muted)]">{row.message}</td>
                  <td className="whitespace-nowrap text-sm text-[var(--text-muted)]">
                    {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                  </td>
                  <td className="text-right">
                    <ResolveExceptionButton exceptionId={row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
