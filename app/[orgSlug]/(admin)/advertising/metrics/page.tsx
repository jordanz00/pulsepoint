import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { AdOpsPageShell } from "@/components/ad-ops/ad-ops-page-shell";
import { adOpsApi } from "@/lib/ad-ops-api";

export default async function AdvertisingMetricsPage() {
  try {
    const metrics = await adOpsApi<
      Array<{
        key: string;
        label: string;
        owner: string;
        timezone: string;
        includesFees: boolean;
        description: string;
      }>
    >("/metrics/registry");

    return (
      <AdOpsPageShell
        title="Metric registry"
        lede="Reporting normalization layer — defines spend vs PulsePoint pulls."
      >
        <div className="pc-table-wrap">
          <table className="pc-table text-sm">
            <thead>
              <tr>
                <th>Key</th>
                <th>Label</th>
                <th>Owner</th>
                <th>Timezone</th>
                <th>Fees</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key}>
                  <td>
                    <code>{m.key}</code>
                  </td>
                  <td>{m.label}</td>
                  <td>{m.owner}</td>
                  <td>{m.timezone}</td>
                  <td>{m.includesFees ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2">
          {metrics.map((m) => (
            <p key={m.key} className="text-sm text-[var(--fg-muted)]">
              <strong className="text-[var(--fg-default)]">{m.key}:</strong> {m.description}
            </p>
          ))}
        </div>
      </AdOpsPageShell>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return (
      <AdOpsPageShell title="Metric registry" lede="Normalized reporting definitions">
        <AdOpsApiError detail={msg} />
      </AdOpsPageShell>
    );
  }
}
