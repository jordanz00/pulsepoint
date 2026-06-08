"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

export type BarListRow = {
  id: string;
  label: string;
  pct: number;
  color?: string;
};

export function AnimatedBarList({
  rows,
  className = "",
}: {
  rows: BarListRow[];
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  return (
    <ul
      className={`pp-animated-bar-list ${className}`.trim()}
      role="list"
      aria-label="Distribution breakdown"
    >
      {rows.map((row, i) => (
        <li key={row.id} className="pp-animated-bar-row">
          <div className="pp-animated-bar-label">
            <span className="pp-animated-bar-label-text">
              <span
                className="pp-animated-bar-swatch"
                style={{ background: row.color ?? "var(--brand-primary)" }}
                aria-hidden
              />
              {row.label}
            </span>
            <span className="pp-animated-bar-pct">{row.pct}%</span>
          </div>
          <div
            className="pp-animated-bar-track"
            role="progressbar"
            aria-valuenow={row.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${row.label}: ${row.pct}%`}
          >
            <div
              className="pp-animated-bar-fill"
              style={{
                width: mounted ? `${row.pct}%` : "0%",
                background: row.color ?? "var(--gradient-primary)",
                transitionDelay: reduced ? "0ms" : `${i * 80}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
