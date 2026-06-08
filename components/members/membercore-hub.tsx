import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

export type MemberCoreHubStats = {
  total: number;
  active: number;
  atRisk: number;
  cSuite: number;
  ourBoard: number;
};

const KPI_ROWS: Array<{
  key: keyof MemberCoreHubStats;
  label: string;
  meta: string;
  productId: ProductId;
}> = [
  { key: "total", label: "In directory", meta: "All member records", productId: "members" },
  { key: "active", label: "Highly engaged", meta: "Active MemberPulse tier", productId: "engage" },
  { key: "atRisk", label: "At risk", meta: "Needs outreach", productId: "advocacy" },
  { key: "cSuite", label: "C-Suite", meta: "Executive contacts", productId: "members" },
  { key: "ourBoard", label: "Our board", meta: "Governance roster", productId: "crm" },
];

/** Executive glass KPI strip — matches marketing MemberCore preview. */
export function MemberCoreHub({
  stats,
}: {
  orgSlug?: string;
  stats: MemberCoreHubStats;
}) {
  return (
    <div className="pp-module-glass-hub" role="region" aria-label="Directory summary">
      <div className="mk-mc-preview-kpis mk-mc-preview-kpis--executive pp-module-glass-kpis">
        {KPI_ROWS.map((row) => (
          <div
            key={row.key}
            className="mk-mod-glass-kpi"
            style={moduleCssVars(row.productId)}
          >
            <span className="mk-mc-preview-kpi-label">{row.label}</span>
            <span className="mk-mod-glass-kpi-value mk-mod-glass-kpi-value--hero">
              {stats[row.key].toLocaleString()}
            </span>
            <span className="mk-mc-preview-kpi-meta">{row.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
