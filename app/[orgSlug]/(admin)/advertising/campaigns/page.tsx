import Link from "next/link";
import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { AdOpsPageShell } from "@/components/ad-ops/ad-ops-page-shell";
import { NewCampaignForm } from "@/components/ad-ops/new-campaign-form";
import { ExecutiveKpiStrip } from "@/components/admin/executive-kpi-strip";
import { adOpsApi } from "@/lib/ad-ops-api";
import { adOpsPaths } from "@/lib/ad-ops-paths";
import type { ExecutiveKpi } from "@/lib/executive-metrics";

export default async function AdvertisingCampaignsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const p = adOpsPaths(orgSlug);

  try {
    const campaigns = await adOpsApi<
      Array<{
        id: string;
        name: string;
        clientName: string;
        state: string;
        budgetUsd: string;
        pulsepointId: string | null;
      }>
    >("/campaigns");

    const totalBudget = campaigns.reduce((s, c) => s + Number(c.budgetUsd), 0);
    const synced = campaigns.filter((c) => c.pulsepointId).length;
    const ready = campaigns.filter((c) => c.state === "READY_TO_TRAFFIC").length;

    const kpis: ExecutiveKpi[] = [
      {
        id: "adops.campaigns",
        label: "Active campaigns",
        value: campaigns.length,
        unit: "count",
        emphasis: "primary",
        group: "events",
      },
      {
        id: "adops.budget",
        label: "Total budget",
        value: totalBudget,
        unit: "usd",
        emphasis: "primary",
        group: "revenue",
      },
      {
        id: "adops.synced",
        label: "Synced to DSP",
        value: synced,
        unit: "count",
        emphasis: "primary",
        group: "events",
      },
      {
        id: "adops.ready",
        label: "Ready to traffic",
        value: ready,
        unit: "count",
        emphasis: "primary",
        group: "events",
      },
    ];

    return (
      <AdOpsPageShell
        title="Campaigns"
        lede="Immutable AMS UUID per campaign. PulsePoint ID set after successful sync."
        kpiStrip={<ExecutiveKpiStrip kpis={kpis} hero />}
      >
        <NewCampaignForm orgSlug={orgSlug} />
        <div className="pc-table-wrap mt-6">
          <table className="pc-table text-sm">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Client</th>
                <th>State</th>
                <th>Budget</th>
                <th>PulsePoint ID</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={p.campaign(c.id)} className="font-medium text-[var(--pc-brand)]">
                      {c.name}
                    </Link>
                  </td>
                  <td>{c.clientName}</td>
                  <td>
                    <span className="badge">{c.state}</span>
                  </td>
                  <td>${Number(c.budgetUsd).toLocaleString()}</td>
                  <td className="text-[var(--fg-muted)]">{c.pulsepointId ?? "—"}</td>
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
      <AdOpsPageShell title="Campaigns" lede="Ad-ops API connection">
        <AdOpsApiError detail={msg} />
      </AdOpsPageShell>
    );
  }
}
