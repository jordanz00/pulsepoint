import { buildProtechGlCsv, demoGlExportLines } from "@/lib/finance/protech-gl-export";

type Props = {
  orgName: string;
  orgSlug: string;
};

/** Finance handoff — download GL reconciliation CSV (BL-027 slice). */
export function ProtechGlExportPanel({ orgName, orgSlug }: Props) {
  const csv = buildProtechGlCsv({ orgName, lines: demoGlExportLines() });
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <section className="pp-gl-export glass pp-glass-surface" aria-labelledby="gl-export-title">
      <header className="pp-gl-export-head">
        <div>
          <p className="pp-eyebrow">Finance · Preview</p>
          <h2 id="gl-export-title" className="pp-gl-export-title">
            Protech GL reconciliation export
          </h2>
          <p className="pp-gl-export-lead">
            CSV slice for dues, events, and giving — map columns to your ERP. Preview rows are
            labeled; live rows match recorded transactions in PulsePoint.
          </p>
        </div>
        <a href={dataUrl} download={`${orgSlug}-gl-reconciliation-sample.csv`} className="pc-btn-primary">
          Download CSV
        </a>
      </header>
      <ul className="pp-gl-export-checklist">
        <li>EventCore + Commerce → standard AR / revenue accounts</li>
        <li>PAC / preview modules marked validation_status=preview</li>
        <li>IT maps debit/credit accounts per Protech chart</li>
      </ul>
    </section>
  );
}
