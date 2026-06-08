import type { PeriodDelta } from "@/lib/dashboard-glass";
import { AnimatedNumber } from "@/components/motion/animated-number";

export function CeoKpiCard({
  eyebrow,
  value,
  numericValue,
  prefix,
  suffix,
  meaning,
  delta,
}: {
  eyebrow: string;
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  meaning: string;
  delta?: PeriodDelta | null;
}) {
  return (
    <article className="ceo-kpi-card ds-card ds-glass">
      <p className="ceo-kpi-card__eyebrow">{eyebrow}</p>
      <p className="ceo-kpi-card__value">
        {numericValue !== undefined ? (
          <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} decimals={0} />
        ) : (
          value
        )}
      </p>
      {delta ? (
        <p className={`ceo-kpi-card__delta ceo-kpi-card__delta--${delta.direction}`}>
          {delta.label}
        </p>
      ) : null}
      <p className="ceo-kpi-card__meaning">{meaning}</p>
    </article>
  );
}
