import Link from "next/link";
import { FlagshipHubShell } from "./flagship-hub-shell";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

export function FlagshipMembershipHub({
  orgSlug,
  stat,
  activeMembers,
  renewalsDue30,
}: {
  orgSlug: string;
  stat: FlagshipFeatureStat;
  activeMembers: number;
  renewalsDue30: number;
}) {
  return (
    <FlagshipHubShell featureId="membership-intelligence" orgSlug={orgSlug} stat={stat}>
      <div className="glass pp-glass-surface" style={{ padding: "var(--ds-6)" }}>
        <h2 className="pp-demo-panel-title">Membership intelligence at a glance</h2>
        <p className="pp-demo-panel-sub">
          Board-ready KPIs and rule-based engagement tiers — same member graph as advocacy and events.
        </p>
        <div className="pp-flagship5-hub__stats" style={{ marginTop: "var(--ds-4)" }}>
          <div className="pp-flagship5-hub__stat">
            <strong>{activeMembers}</strong>
            <span>active members</span>
          </div>
          <div className="pp-flagship5-hub__stat">
            <strong>{renewalsDue30}</strong>
            <span>renewals due (30 days)</span>
          </div>
          <div className="pp-flagship5-hub__stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        </div>
        <div className="pp-flagship5-card__actions" style={{ marginTop: "var(--ds-4)" }}>
          <Link href={`/${orgSlug}/members/analytics`} className="pc-btn-primary text-sm">
            Open analytics
          </Link>
          <Link href={`/${orgSlug}/members/pulse`} className="pc-btn-secondary text-sm">
            MemberPulse
          </Link>
        </div>
      </div>
    </FlagshipHubShell>
  );
}
