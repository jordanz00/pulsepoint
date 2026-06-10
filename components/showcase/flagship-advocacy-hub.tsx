import type { AdvocacyDashboardStats } from "@/lib/advocacy-dashboard";
import { FlagshipHubShell } from "./flagship-hub-shell";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

export function FlagshipAdvocacyHub({
  orgSlug,
  stat,
  advocacy,
}: {
  orgSlug: string;
  stat: FlagshipFeatureStat;
  advocacy: AdvocacyDashboardStats;
}) {
  return (
    <FlagshipHubShell featureId="advocacy-one-roster" orgSlug={orgSlug} stat={stat}>
      <div className="glass pp-glass-surface" style={{ padding: "var(--ds-6)" }}>
        <h2 className="pp-demo-panel-title">Hospital roster linkage</h2>
        <p className="pp-demo-panel-sub">
          Advocacy campaigns roll up to hospital accounts on the same MemberCore roster — no separate
          grassroots database.
        </p>
        <div className="pp-flagship5-hub__stats" style={{ marginTop: "var(--ds-4)" }}>
          <div className="pp-flagship5-hub__stat">
            <strong>{advocacy.hospitalAccounts}</strong>
            <span>hospital accounts</span>
          </div>
          <div className="pp-flagship5-hub__stat">
            <strong>{advocacy.membersOnHospitalRoster}</strong>
            <span>members on roster</span>
          </div>
          <div className="pp-flagship5-hub__stat">
            <strong>{advocacy.hospitalEngagementPct}%</strong>
            <span>hospital engagement</span>
          </div>
          <div className="pp-flagship5-hub__stat">
            <strong>{advocacy.takeActionResponsesThisMonth}</strong>
            <span>take-action this month</span>
          </div>
        </div>
      </div>
    </FlagshipHubShell>
  );
}
