import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { AdOpsPageShell } from "@/components/ad-ops/ad-ops-page-shell";
import { adOpsApi } from "@/lib/ad-ops-api";

export default async function AdvertisingAuditPage() {
  try {
    const logs = await adOpsApi<
      Array<{
        id: string;
        entityType: string;
        entityId: string;
        action: string;
        createdAt: string;
        actor: { email: string } | null;
      }>
    >("/audit?limit=80");

    return (
      <AdOpsPageShell title="Audit log" lede="Immutable before/after — no PHI.">
        <div className="pc-table-wrap">
          <table className="pc-table text-sm">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="text-[var(--fg-muted)]">{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.actor?.email ?? "system"}</td>
                  <td>
                    {l.entityType} <code>{l.entityId.slice(0, 8)}…</code>
                  </td>
                  <td>{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdOpsPageShell>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return (
      <AdOpsPageShell title="Audit log" lede="Compliance and change history">
        <AdOpsApiError detail={msg} />
      </AdOpsPageShell>
    );
  }
}
