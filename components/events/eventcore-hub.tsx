import Link from "next/link";
import type { EventCoreSummary } from "@/lib/load-eventcore-summary";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

const KPI_ROWS: Array<{
  key: keyof EventCoreSummary;
  label: string;
  meta: string;
  productId: ProductId;
}> = [
  { key: "totalEvents", label: "Events", meta: "All programs in catalog", productId: "events" },
  { key: "upcoming", label: "Upcoming", meta: "Published · future dates", productId: "events" },
  { key: "registrationsTotal", label: "Registrations", meta: "Confirmed + pending", productId: "commerce" },
  { key: "checkedInTotal", label: "Checked in", meta: "Day-of attendance", productId: "engage" },
];

/** Executive glass KPI strip — matches marketing EventCore preview. */
export function EventCoreHub({
  orgSlug,
  stats,
}: {
  orgSlug: string;
  stats: EventCoreSummary;
}) {
  return (
    <div className="ec-hub pp-module-glass-hub">
      <div
        className="mk-mc-preview-kpis mk-mc-preview-kpis--executive pp-module-glass-kpis"
        role="region"
        aria-label="Events summary"
      >
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
      <div className="pp-module-actions">
        <Link href={`/${orgSlug}/events/new`} className="pc-btn-primary text-sm">
          New event
        </Link>
        <Link href={`/${orgSlug}/engage`} className="pc-btn-secondary text-sm">
          Email templates
        </Link>
      </div>
    </div>
  );
}
