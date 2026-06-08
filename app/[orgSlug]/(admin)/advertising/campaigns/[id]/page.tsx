import Link from "next/link";
import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { AdOpsPageShell } from "@/components/ad-ops/ad-ops-page-shell";
import { CampaignActions } from "@/components/ad-ops/campaign-actions";
import { CreativeActions } from "@/components/ad-ops/creative-actions";
import { adOpsApi } from "@/lib/ad-ops-api";
import { adOpsPaths } from "@/lib/ad-ops-paths";

export default async function AdvertisingCampaignDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;
  const p = adOpsPaths(orgSlug);

  try {
    const [campaign, readiness, reconcile] = await Promise.all([
      adOpsApi<{
        id: string;
        amsUuid: string;
        name: string;
        clientName: string;
        state: string;
        budgetUsd: string;
        pulsepointId: string | null;
        audienceQaAt: string | null;
        budgetQaAt: string | null;
        creativeQaAt: string | null;
        creatives: Array<{ id: string; name: string; state: string; contentHash: string | null }>;
        audienceLists: Array<{ version: number; valid: boolean; rowCount: number }>;
        syncJobs: Array<{ id: string; status: string; errorCode: string | null; errorDetail: string | null }>;
        idMappings: Array<{
          amsField: string;
          pulsepointField: string;
          amsValue: string | null;
          pulsepointValue: string | null;
        }>;
        pacingAlerts: Array<{ message: string; pacingPct: string }>;
      }>(`/campaigns/${id}`),
      adOpsApi<{ ready: boolean; reasons: string[] }>(`/campaigns/${id}/ready-check`),
      adOpsApi<{ run: { deltaExplain: string | null; withinTolerance: boolean } | null }>(
        `/campaigns/${id}/reconcile/spend_usd`,
      ).catch(() => ({ run: null })),
    ]);

    return (
      <AdOpsPageShell
        title={campaign.name}
        lede={`${campaign.clientName} · AMS UUID ${campaign.amsUuid}`}
        backHref={p.campaigns}
        backLabel="Campaigns"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Status</h2>
            <p>
              <span className="badge">{campaign.state}</span>
            </p>
            <p>
              PulsePoint ID: <strong>{campaign.pulsepointId ?? "Not synced"}</strong>
            </p>
            <p>Budget: ${Number(campaign.budgetUsd).toLocaleString()}</p>
            <p className="text-sm text-[var(--fg-muted)]">
              QA gates: Audience {campaign.audienceQaAt ? "✓" : "—"} · Budget{" "}
              {campaign.budgetQaAt ? "✓" : "—"} · Creative {campaign.creativeQaAt ? "✓" : "—"}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Explain the delta</h2>
            {reconcile.run ? (
              <>
                <p className="text-sm">{reconcile.run.deltaExplain}</p>
                <span className={reconcile.run.withinTolerance ? "badge badge--ok" : "badge badge--err"}>
                  {reconcile.run.withinTolerance ? "Within tolerance" : "Review required"}
                </span>
              </>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">Run reconciliation after sync.</p>
            )}
          </section>
        </div>

        {campaign.pacingAlerts.length > 0 ? (
          <section className="mt-6 space-y-2">
            <h2 className="text-lg font-semibold">Pacing alerts</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {campaign.pacingAlerts.map((a, i) => (
                <li key={i}>{a.message}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-6 space-y-4">
          <CampaignActions campaignId={id} state={campaign.state} readiness={readiness} />
          <CreativeActions campaignId={id} creatives={campaign.creatives} />
        </div>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Canonical ID map</h2>
          <div className="pc-table-wrap">
            <table className="pc-table text-sm">
              <thead>
                <tr>
                  <th>AMS field</th>
                  <th>PulsePoint field</th>
                  <th>AMS</th>
                  <th>PulsePoint</th>
                </tr>
              </thead>
              <tbody>
                {campaign.idMappings.map((m) => (
                  <tr key={m.amsField}>
                    <td>{m.amsField}</td>
                    <td>{m.pulsepointField}</td>
                    <td>{m.amsValue ?? "—"}</td>
                    <td>{m.pulsepointValue ?? "—"}</td>
                  </tr>
                ))}
                {campaign.idMappings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-[var(--fg-muted)]">
                      Populated after sync
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Sync history</h2>
          <div className="pc-table-wrap">
            <table className="pc-table text-sm">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Error</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {campaign.syncJobs.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <span
                        className={
                          j.status === "SUCCEEDED"
                            ? "badge badge--ok"
                            : j.status === "FAILED" || j.status === "DEAD"
                              ? "badge badge--err"
                              : "badge"
                        }
                      >
                        {j.status}
                      </span>
                    </td>
                    <td>
                      {j.errorCode ? (
                        <Link href={p.runbook(j.errorCode)}>{j.errorCode}</Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-[var(--fg-muted)]">{j.errorDetail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AdOpsPageShell>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return (
      <AdOpsPageShell title="Campaign" lede="Campaign detail" backHref={p.campaigns}>
        <AdOpsApiError detail={msg} />
      </AdOpsPageShell>
    );
  }
}
