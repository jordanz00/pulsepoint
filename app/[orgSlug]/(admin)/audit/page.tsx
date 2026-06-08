import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { getAuditLog } from "@/app/actions/audit";
import { requirePageCapability } from "@/lib/admin-page-guard";

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requirePageCapability(orgSlug, "org:settings");

  const result = await getAuditLog({ take: 50 }, orgSlug);
  const rows = result.ok && result.data ? result.data.items : [];

  const now = new Date();

  return (
    <div className="pc-admin-page">
      <PageHeader
        title="Audit log"
        subtitle="Staff actions recorded for compliance review."
        eyebrow="Compliance"
      />

      <Card padding="none" className="pp-audit-panel overflow-hidden">
        {rows.length === 0 ? (
          <p className="pp-empty-copy">No audit entries yet.</p>
        ) : (
          <ul className="pp-audit-list">
            {rows.map((row) => (
              <li key={row.id} className="pp-audit-row">
                <span className="pp-glass-activity-dot pp-glass-activity-dot--member" aria-hidden />
                <span className="pp-audit-summary">
                  <strong>{row.entity}</strong> · {row.action.replace(/\./g, " ")}
                </span>
                <time className="pp-audit-time" dateTime={row.createdAt.toISOString()}>
                  {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
