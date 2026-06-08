import type { PeriodDelta } from "@/lib/dashboard-glass";

export type GlassStatCardProps = {
  label: string;
  value: string;
  delta?: PeriodDelta | null;
};

/** Liquid glass KPI — 26px value, 11px uppercase label, colored delta line. */
export function GlassStatCard({ label, value, delta }: GlassStatCardProps) {
  return (
    <article className="pp-glass-stat-card glass pp-glass-surface">
      <p className="pp-glass-stat-label">{label}</p>
      <p className="pp-glass-stat-value">{value}</p>
      {delta ? (
        <p
          className={`pp-glass-stat-delta pp-glass-stat-delta--${delta.direction}`}
          aria-label={`Change: ${delta.label}`}
        >
          {delta.label}
        </p>
      ) : null}
    </article>
  );
}
