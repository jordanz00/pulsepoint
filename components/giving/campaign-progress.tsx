export function CampaignProgress({
  raisedCents,
  goalCents,
  progressPct,
  variant = "full",
}: {
  raisedCents: number;
  goalCents: number;
  progressPct: number | null;
  variant?: "full" | "inline" | "glass";
}) {
  const fmt = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      cents / 100,
    );

  if (variant === "glass") {
    const barPct = progressPct != null ? Math.min(100, progressPct) : 0;
    return (
      <div className="pp-giving-campaign-glass">
        <div className="pp-giving-campaign-glass-head">
          <span className="pp-giving-campaign-glass-raised">{fmt(raisedCents)}</span>
          {goalCents > 0 ? (
            <span className="pp-giving-campaign-glass-goal"> of {fmt(goalCents)}</span>
          ) : null}
          {progressPct != null ? (
            <span className="pp-giving-campaign-glass-pct">{progressPct}%</span>
          ) : null}
        </div>
        {goalCents > 0 && progressPct != null ? (
          <div className="mk-mc-preview-facility-track" role="progressbar" aria-valuenow={barPct} aria-valuemin={0} aria-valuemax={100}>
            <span className="mk-mc-preview-facility-fill" style={{ width: `${barPct}%` }} />
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "inline") {
    const inline =
      goalCents > 0 && progressPct != null
        ? `${fmt(raisedCents)} raised · ${progressPct}% of ${fmt(goalCents)}`
        : `${fmt(raisedCents)} raised`;
    return <p className="giving-progress giving-progress--inline">{inline}</p>;
  }

  const barPct = progressPct != null ? Math.min(100, progressPct) : 0;
  const progressLabel =
    goalCents > 0 && progressPct != null
      ? `${fmt(raisedCents)} raised of ${fmt(goalCents)} goal (${progressPct}%)`
      : `${fmt(raisedCents)} raised`;

  return (
    <div className="giving-progress">
      <p className="giving-progress__summary">
        <span className="giving-progress__raised">{fmt(raisedCents)}</span>
        {goalCents > 0 ? (
          <span className="giving-progress__goal"> of {fmt(goalCents)}</span>
        ) : (
          <span className="giving-progress__goal"> raised</span>
        )}
        {progressPct != null ? (
          <span className="giving-progress__pct"> · {progressPct}%</span>
        ) : null}
      </p>
      {goalCents > 0 && progressPct != null ? (
        <div
          className="giving-progress__bar"
          role="progressbar"
          aria-valuenow={barPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel}
        >
          <div className="giving-progress__fill" style={{ width: `${barPct}%` }} />
        </div>
      ) : null}
    </div>
  );
}
