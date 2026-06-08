import Link from "next/link";
import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { AdOpsPageShell } from "@/components/ad-ops/ad-ops-page-shell";
import { ExecutiveKpiStrip } from "@/components/admin/executive-kpi-strip";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { adOpsApi } from "@/lib/ad-ops-api";
import { adOpsPaths } from "@/lib/ad-ops-paths";
import type { ExecutiveKpi } from "@/lib/executive-metrics";

export default async function AdvertisingDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const p = adOpsPaths(orgSlug);

  try {
    const [campaigns, jobs, checklist] = await Promise.all([
      adOpsApi<Array<{ id: string; name: string; state: string; clientName: string }>>("/campaigns"),
      adOpsApi<Array<{ id: string; status: string; errorCode: string | null }>>("/sync/jobs"),
      adOpsApi<{ title: string; steps: Array<{ id: number; label: string }> }>("/onboarding/checklist"),
    ]);

    const failed = jobs.filter((j) => j.status === "FAILED" || j.status === "DEAD").length;
    const healthy = failed === 0;

    const kpis: ExecutiveKpi[] = [
      {
        id: "adops.campaigns",
        label: "Campaigns",
        value: campaigns.length,
        unit: "count",
        emphasis: "primary",
        group: "events",
      },
      {
        id: "adops.sync_jobs",
        label: "Sync jobs",
        value: jobs.length,
        unit: "count",
        emphasis: "primary",
        group: "events",
      },
      {
        id: "adops.failed",
        label: "Need attention",
        value: failed,
        unit: "count",
        emphasis: "primary",
        group: "members",
      },
      {
        id: "adops.checklist",
        label: "Onboarding steps",
        value: checklist.steps.length,
        unit: "count",
        emphasis: "primary",
        group: "revenue",
      },
    ];

    return (
      <>
        <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="advertising" />
        <AdOpsPageShell
          title="Healthcare advertising operations"
          lede="AMS is system of record — PulsePoint DSP is execution only; sync state always visible."
          kpiStrip={<ExecutiveKpiStrip kpis={kpis} hero />}
        >
        <div className="ad-ops-glass-grid">
          <div className="ad-ops-glass-panel">
            <h2 className="ad-ops-glass-panel-title">Sync queue</h2>
            <p className={`ad-ops-glass-stat ${healthy ? "ad-ops-glass-stat--ok" : "ad-ops-glass-stat--err"}`}>
              {healthy ? "Healthy" : `${failed} need attention`}
            </p>
            <Link href={p.sync} className="ad-ops-glass-link">
              Open queue →
            </Link>
          </div>
          <div className="ad-ops-glass-panel">
            <h2 className="ad-ops-glass-panel-title">{checklist.title}</h2>
            <ol className="ad-ops-glass-steps">
              {checklist.steps.map((s) => (
                <li key={s.id}>{s.label}</li>
              ))}
            </ol>
            <Link href={p.onboarding} className="ad-ops-glass-link">
              Full checklist →
            </Link>
          </div>
        </div>

        <div className="ad-ops-glass-panel ad-ops-glass-panel--wide">
          <div className="ad-ops-glass-panel-head">
            <h2 className="ad-ops-glass-panel-title">Recent campaigns</h2>
            <Link href={p.campaigns} className="ad-ops-glass-link">
              View all →
            </Link>
          </div>
          <table className="ad-ops-glass-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Client</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={p.campaign(c.id)}>{c.name}</Link>
                  </td>
                  <td>{c.clientName}</td>
                  <td>
                    <span className="badge">{c.state}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdOpsPageShell>
      </>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return (
      <>
        <ModuleLandingBriefing orgId={staff.orgId} orgSlug={orgSlug} productId="advertising" />
        <AdOpsPageShell title="Healthcare advertising operations" lede="Ad-ops API connection">
          <AdOpsApiError detail={msg} />
        </AdOpsPageShell>
      </>
    );
  }
}
