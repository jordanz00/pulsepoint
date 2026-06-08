import Link from "next/link";
import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { AdOpsPageShell } from "@/components/ad-ops/ad-ops-page-shell";
import { adOpsApi } from "@/lib/ad-ops-api";
import { adOpsPaths } from "@/lib/ad-ops-paths";

export default async function AdvertisingSyncPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const p = adOpsPaths(orgSlug);

  try {
    const jobs = await adOpsApi<
      Array<{
        id: string;
        status: string;
        errorCode: string | null;
        errorDetail: string | null;
        createdAt: string;
        campaign: { name: string; amsUuid: string };
      }>
    >("/sync/jobs");

    return (
      <AdOpsPageShell
        title="Sync queue"
        lede="Visible errors — no silent failures. Retry from campaign after fix."
      >
        <div className="pc-table-wrap">
          <table className="pc-table text-sm">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Error</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.campaign.name}</td>
                  <td>
                    <span className="badge">{j.status}</span>
                  </td>
                  <td>
                    {j.errorCode ? (
                      <Link href={p.runbook(j.errorCode)}>{j.errorCode}</Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-[var(--fg-muted)]">{new Date(j.createdAt).toLocaleString()}</td>
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
      <AdOpsPageShell title="Sync queue" lede="Job status and error visibility">
        <AdOpsApiError detail={msg} />
      </AdOpsPageShell>
    );
  }
}
