import Link from "next/link";
import { COMPARE_PROTECH_ROWS } from "@/lib/marketing/compare-protech";
import { FlagshipHubShell } from "./flagship-hub-shell";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

const TEASER_ROWS = COMPARE_PROTECH_ROWS.slice(0, 4);

export function FlagshipMigrationHub({
  orgSlug,
  stat,
}: {
  orgSlug: string;
  stat: FlagshipFeatureStat;
}) {
  return (
    <FlagshipHubShell featureId="migration-honest" orgSlug={orgSlug} stat={stat}>
      <div className="glass pp-glass-surface" style={{ padding: "var(--ds-6)" }}>
        <h2 className="pp-demo-panel-title">Honest migration path</h2>
        <p className="pp-demo-panel-sub">
          Stage CSV imports with duplicate review — then compare capability scope without claiming
          day-one parity.
        </p>
        <ul style={{ listStyle: "none", margin: "var(--ds-4) 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "var(--ds-3)" }}>
          {TEASER_ROWS.map((row) => (
            <li
              key={row.category}
              style={{
                padding: "var(--ds-3) var(--ds-4)",
                borderRadius: "var(--ds-radius-md)",
                border: "1px solid var(--ds-border-subtle)",
                fontSize: "var(--ds-text-caption)",
              }}
            >
              <strong>{row.category}</strong>
              <span style={{ display: "block", color: "var(--ds-fg-muted)", marginTop: 4 }}>
                PulsePoint: {row.pulsepoint}
              </span>
              <span
                className={row.pulseStatus === "live" ? "badge-live" : "badge-alpha"}
                style={{ marginTop: 6, display: "inline-block" }}
              >
                {row.pulseStatus === "live" ? "Live" : row.pulseStatus === "alpha" ? "Alpha" : "Roadmap"}
              </span>
            </li>
          ))}
        </ul>
        <div className="pp-flagship5-card__actions" style={{ marginTop: "var(--ds-4)" }}>
          <Link href={`/${orgSlug}/members/imports`} className="pc-btn-primary text-sm">
            Import staging
          </Link>
          <Link href="/compare-protech" className="pc-btn-secondary text-sm">
            Full Protech compare
          </Link>
        </div>
      </div>
    </FlagshipHubShell>
  );
}
