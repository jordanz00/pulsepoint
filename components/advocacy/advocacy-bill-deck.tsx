import { moduleCssVars } from "@/lib/module-colors";
import { modMixSegmentProps } from "@/lib/marketing-module-glass";

export type AdvocacyIssueRow = {
  id: string;
  title: string;
  jurisdiction: string;
  status: string;
  billNumber: string | null;
};

/** Agenda mix + bill tracker — mirrors marketing advocacy preview from live issues. */
export function AdvocacyBillDeck({ issues }: { issues: AdvocacyIssueRow[] }) {
  const stateCount = issues.filter((i) => i.jurisdiction.toLowerCase() !== "federal").length;
  const federalCount = issues.length - stateCount;
  const total = issues.length || 1;
  const statePct = Math.round((stateCount / total) * 100);
  const federalPct = 100 - statePct;

  const bills = issues
    .filter((i) => i.billNumber)
    .slice(0, 6)
    .map((i) => ({
      id: i.id,
      label: i.billNumber!,
      meta: `${i.jurisdiction} · ${i.status}`,
      title: i.title,
      productId: i.jurisdiction.toLowerCase() === "federal" ? ("advocacy" as const) : ("crm" as const),
    }));

  const agendaSegments =
    issues.length > 0
      ? [
          { label: "State", pct: statePct, productId: "crm" as const },
          { label: "Federal", pct: federalPct, productId: "advocacy" as const },
        ]
      : [];

  return (
    <div className="mk-mc-preview-analytics-deck pp-advocacy-bill-deck" aria-label="Agenda and bill tracker">
      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
        style={moduleCssVars("advocacy")}
      >
        <p className="mk-mc-preview-panel-label">Agenda focus</p>
        {agendaSegments.length > 0 ? (
          <>
            <div className="mk-mc-preview-mix-bar mk-mc-preview-mix-bar--hero" role="presentation">
              {agendaSegments.map((s) => {
                const seg = modMixSegmentProps(s.productId, s.pct);
                return <span key={s.label} {...seg} title={`${s.label} ${s.pct}%`} />;
              })}
            </div>
            <ul className="mk-mc-preview-mix-stats">
              {agendaSegments.map((s) => (
                <li key={s.label} style={moduleCssVars(s.productId)}>
                  <span className="mk-mc-preview-mix-pct">{s.pct}%</span>
                  <span className="mk-mc-preview-mix-name">
                    {s.label} ({s.label === "State" ? stateCount : federalCount})
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="pp-advocacy-empty">Add issues to see state vs federal agenda mix.</p>
        )}
      </div>

      <div
        className="mk-mc-preview-panel mk-mc-preview-panel--executive mk-mod-glass-panel"
        style={moduleCssVars("crm")}
      >
        <p className="mk-mc-preview-panel-label">Bill tracker</p>
        {bills.length > 0 ? (
          <ul className="pp-adv-preview-bills">
            {bills.map((b) => (
              <li key={b.id} style={moduleCssVars(b.productId)}>
                <span className="pp-adv-preview-bill-label">{b.label}</span>
                <span className="pp-adv-preview-bill-meta">{b.meta}</span>
                <span className="pp-adv-preview-bill-title">{b.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pp-advocacy-empty">
            Bills appear when issues include a bill number — legislative feed adapter is roadmap until IT
            connects a vendor.
          </p>
        )}
      </div>
    </div>
  );
}
