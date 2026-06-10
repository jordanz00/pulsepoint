import type { ReactNode } from "react";
import { EnterpriseTableDensityToggle } from "@/components/enterprise/enterprise-table-density-toggle";

/** Enterprise table shell — density, count, sticky header (Sprint 7). */
export function EnterpriseDataTable({
  caption,
  count,
  empty,
  children,
  defaultDensity = "comfortable",
  actions,
}: {
  caption: string;
  count?: number;
  empty?: ReactNode;
  children: ReactNode;
  defaultDensity?: "compact" | "comfortable";
  actions?: ReactNode;
}) {
  if (count === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <section className="pp-data-table-shell glass pp-glass-surface" aria-label={caption}>
      <div className="pp-data-table-shell__head">
        <div>
          <h2 className="pp-data-table-shell__caption">{caption}</h2>
          {count !== undefined ? (
            <p className="pp-data-table-shell__count">{count.toLocaleString()} row{count === 1 ? "" : "s"}</p>
          ) : null}
        </div>
        <div className="pp-data-table-shell__actions">
          {actions}
          <EnterpriseTableDensityToggle defaultDensity={defaultDensity} />
        </div>
      </div>
      <div className="pp-data-table-wrap">
        <table className={`pp-data-table pp-data-table--${defaultDensity}`} data-density={defaultDensity}>
          {children}
        </table>
      </div>
    </section>
  );
}
