/**
 * HospitalAssociationStrip — executive glass metrics for hospital & health system associations.
 */

import Link from "next/link";
import { loadHospitalAssociationSnapshot } from "@/lib/hospital-association-snapshot";

type Tile = {
  label: string;
  value: string;
  meaning: string;
  href: string;
  topic?: "members" | "engagement" | "events" | "finance";
};

export async function HospitalAssociationStrip({
  orgId,
  orgSlug,
  variant = "full",
}: {
  orgId: string;
  orgSlug: string;
  variant?: "compact" | "full";
}) {
  const snap = await loadHospitalAssociationSnapshot(orgId);
  const base = `/${orgSlug}`;

  const allTiles: Tile[] = [
    {
      label: "Hospital accounts",
      value: snap.hospitalAccounts.toLocaleString(),
      meaning: "Member hospitals & health systems on roster",
      href: `${base}/enterprise/organizations`,
      topic: "members",
    },
    {
      label: "On hospital roster",
      value: snap.membersOnHospitalRoster.toLocaleString(),
      meaning: "Active members linked to a hospital account",
      href: `${base}/members/analytics`,
      topic: "members",
    },
    {
      label: "Hospital engagement",
      value: `${snap.hospitalEngagementPct}%`,
      meaning: "Hospitals with active or moderate MemberPulse",
      href: `${base}/enterprise/advocacy`,
      topic: "engagement",
    },
    {
      label: "Take-action responses",
      value: snap.hospitalsWithTakeActionResponse.toLocaleString(),
      meaning: "Hospitals that submitted advocacy responses",
      href: `${base}/enterprise/advocacy`,
      topic: "engagement",
    },
    {
      label: "Committees",
      value: snap.committeeCount.toLocaleString(),
      meaning: "Active governance & policy committees",
      href: `${base}/committees`,
      topic: "events",
    },
    {
      label: "Emergency contacts",
      value: snap.emergencyContactCount.toLocaleString(),
      meaning: "Hospital readiness roster on file",
      href: `${base}/enterprise/emergency`,
      topic: "events",
    },
    {
      label: "Advocacy issues",
      value: snap.activeAdvocacyIssues.toLocaleString(),
      meaning: "Active or tracking policy priorities",
      href: `${base}/enterprise/advocacy/issues`,
      topic: "engagement",
    },
    {
      label: "Live campaigns",
      value: snap.activeCampaigns.toLocaleString(),
      meaning: "Take-action & outreach campaigns running",
      href: `${base}/enterprise/advocacy`,
      topic: "engagement",
    },
  ];

  const tiles = variant === "compact" ? allTiles.slice(0, 4) : allTiles;

  return (
    <section className="pp-ha-strip" aria-labelledby="ha-strip-title">
      <header className="pp-demo-panel-head pp-demo-panel-head--inline">
        <div>
          <h2 id="ha-strip-title" className="pp-demo-panel-title">
            Hospital association
          </h2>
          <p className="pp-demo-panel-sub">
            Roster, advocacy, governance, and emergency readiness — live from your tenant.
          </p>
        </div>
        <Link href={`${base}/enterprise`} className="pc-link text-sm font-semibold">
          Enterprise AMS →
        </Link>
      </header>
      <ul className="pp-ha-strip__grid" role="list">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className={`pp-ha-strip__tile glass pp-glass-surface pp-glass-interactive${tile.topic ? ` pp-topic-card pp-topic-card--${tile.topic}` : ""}`}
            >
              <span className="pp-ha-strip__label">{tile.label}</span>
              <span className="pp-ha-strip__value">{tile.value}</span>
              <span className="pp-ha-strip__meaning">{tile.meaning}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
