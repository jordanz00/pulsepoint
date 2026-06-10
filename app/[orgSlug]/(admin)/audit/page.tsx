import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { getAuditLog } from "@/app/actions/audit";
import { requirePageCapability } from "@/lib/admin-page-guard";
import { formatAuditAction } from "@/lib/compliance-ops";
import { EnterpriseDataTable } from "@/components/enterprise/enterprise-data-table";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requirePageCapability(orgSlug, "org:settings");

  const result = await getAuditLog({ take: 50 }, orgSlug);
  const rows = result.ok && result.data ? result.data.items : [];

  return (
    <div className="pc-admin-page">
      <PageHeader
        title="Audit log"
        subtitle="Staff actions recorded for compliance review."
        eyebrow="Compliance"
        actions={
          <Link href={`/${orgSlug}/compliance`} className="pc-btn-secondary text-sm">
            Compliance center
          </Link>
        }
      />

      <EnterpriseDataTable
        caption="Staff audit trail"
        count={rows.length}
        empty={
          <EnterpriseStatePanel
            variant="empty"
            title="No audit entries yet"
            description="Staff actions appear here as they occur — exports, imports, advocacy changes, and settings updates."
          />
        }
      >
        <thead>
          <tr>
            <th scope="col">Entity</th>
            <th scope="col">Action</th>
            <th scope="col">Entity ID</th>
            <th scope="col">When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="pp-data-table__primary">{row.entity}</td>
              <td>{formatAuditAction(row.action)}</td>
              <td className="pp-data-table__muted pp-data-table__mono">
                {row.entityId ? `${row.entityId.slice(0, 10)}…` : "—"}
              </td>
              <td className="pp-data-table__muted pp-data-table__nowrap">
                <time dateTime={row.createdAt.toISOString()}>
                  {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </EnterpriseDataTable>
    </div>
  );
}
