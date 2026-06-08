import { moduleCssVars } from "@/lib/module-colors";

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** PAC-style pace panel — live raised vs combined campaign goals. */
export function GivingPacePanel({
  raisedCents,
  goalCents,
  activeCampaigns,
}: {
  raisedCents: number;
  goalCents: number;
  activeCampaigns: number;
}) {
  const pacePct =
    goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : null;

  return (
    <div
      className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel pp-giving-pace-panel"
      style={moduleCssVars("giving")}
      aria-label="Fundraising pace"
    >
      <p className="mk-mc-preview-panel-label">Are we on pace?</p>
      <div className="pp-pac-pace-simple">
        <p className="pp-pac-pace-big">
          {fmtUsd(raisedCents)}
          {goalCents > 0 ? (
            <>
              <span className="pp-pac-pace-of"> of </span>
              {fmtUsd(goalCents)}
            </>
          ) : null}
        </p>
        {pacePct != null ? (
          <p className="pp-pac-pace-pct">{pacePct}% of combined active goals</p>
        ) : (
          <p className="pp-pac-pace-pct">Set campaign goals to track pace</p>
        )}
      </div>
      {pacePct != null ? (
        <div className="mk-mc-preview-facility-track pp-pac-pace-track" role="presentation">
          <span className="mk-mc-preview-facility-fill" style={{ width: `${pacePct}%` }} />
        </div>
      ) : null}
      <p className="pp-pac-pace-note">
        {activeCampaigns} active campaign{activeCampaigns === 1 ? "" : "s"} · live gift totals
      </p>
    </div>
  );
}
