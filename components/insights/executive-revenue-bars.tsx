"use client";

import { AnimatedBarList, type BarListRow } from "@/components/charts/animated-bar-list";

export function ExecutiveRevenueBars({
  lines,
  maxCents,
}: {
  lines: { id: string; label: string; amountCents: number }[];
  maxCents: number;
}) {
  const rows: BarListRow[] = lines.map((line) => ({
    id: line.id,
    label: line.label,
    pct: Math.max(Math.round((line.amountCents / maxCents) * 100), 4),
  }));

  return <AnimatedBarList rows={rows} className="mt-3" />;
}
