import type { ExecutiveKpi } from "@/lib/executive-metrics";
import { GlassStatCardLive } from "@/components/admin/glass-stat-card-live";
import type { PeriodDelta } from "@/lib/dashboard-glass";
import { kpiTopic } from "@/lib/dashboard-topic-colors";
import type { ChartPoint } from "@/lib/motion/chart-samples";

const WHY_IT_MATTERS: Record<string, string> = {
  "revenue.total": "Total funding available for programs, staff, and advocacy.",
  "revenue.dues": "Core membership income — stability for the annual budget.",
  "revenue.non_dues": "Events and fundraising reduce reliance on dues alone.",
  "members.active": "Active members are who you serve and represent.",
};

function fmtKpi(kpi: ExecutiveKpi): { value: string; numericValue: number; prefix?: string; suffix?: string } {
  if (kpi.unit === "usd") {
    return {
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpi.value),
      numericValue: Math.round(kpi.value),
      prefix: "$",
    };
  }
  return {
    value: kpi.value.toLocaleString(),
    numericValue: kpi.value,
  };
}

type Props = {
  kpis: ExecutiveKpi[];
  deltas?: Record<string, PeriodDelta | null>;
  hero?: boolean;
  /** Show only these KPI ids (order preserved) */
  includeIds?: string[];
  sparklines?: Record<string, ChartPoint[]>;
};

export function ExecutiveKpiStrip({ kpis, deltas = {}, hero = true, includeIds, sparklines = {} }: Props) {
  const primary = kpis.filter((k) => k.emphasis === "primary");
  const picked = includeIds?.length
    ? includeIds
        .map((id) => primary.find((k) => k.id === id))
        .filter((k): k is ExecutiveKpi => k != null)
    : primary.slice(0, 4);

  return (
    <div className={hero ? "pp-executive-kpi-strip" : "pp-glass-stat-grid"} role="list">
      {picked.map((kpi) => {
        const f = fmtKpi(kpi);
        const why = WHY_IT_MATTERS[kpi.id];
        return (
          <div key={kpi.id} className="pp-executive-kpi-cell" role="listitem">
            <GlassStatCardLive
              label={kpi.label}
              value={f.value}
              numericValue={f.numericValue}
              prefix={f.prefix}
              suffix={f.suffix}
              delta={deltas[kpi.id] ?? null}
              hero={hero}
              topic={kpiTopic(kpi.id)}
              sparklineData={sparklines[kpi.id]}
            />
            {why ? (
              <p className="pp-kpi-why text-xs text-[var(--fg-muted)] mt-2 px-1">{why}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
