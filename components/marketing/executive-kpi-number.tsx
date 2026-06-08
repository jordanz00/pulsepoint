"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";

/**
 * Executive KPI value — prefix, digits, and suffix (K, %) share one size on one baseline.
 */
export function ExecutiveKpiNumber({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={["mk-executive-kpi-number", className].filter(Boolean).join(" ")}>
      <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
    </span>
  );
}
