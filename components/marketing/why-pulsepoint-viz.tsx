"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

/** Circular progress — iOS-style metric ring. */
export function WhyPulsePointRing({
  pct,
  size = 120,
  stroke = 8,
  label,
  sublabel,
  muted = false,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  muted?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(reduced);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (mounted ? (pct / 100) * c : 0);

  useEffect(() => {
    if (reduced) return;
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [reduced, pct]);

  return (
    <div
      className={`pp-why-ring${muted ? " pp-why-ring--muted" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label}: ${pct}%` : `${pct} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="pp-why-ring-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="pp-why-ring-fill"
        />
      </svg>
      <div className="pp-why-ring-center">
        <span className="pp-why-ring-value">{pct}%</span>
        {sublabel ? <span className="pp-why-ring-sublabel">{sublabel}</span> : null}
      </div>
      {label ? <span className="pp-why-ring-label">{label}</span> : null}
    </div>
  );
}

/** Mini trend line for module bento cards. */
export function WhyPulsePointSparkline({
  points,
  color = "var(--mod-active-fg, var(--brand-primary))",
}: {
  points: readonly number[];
  color?: string;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = coords.join(" ");

  return (
    <svg
      className="pp-why-sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="why-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${polyline} ${w},${h}`}
        fill="url(#why-spark-fill)"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** MemberCore hub with module spokes — highlights active module on hover. */
export function WhyPulsePointSpine({
  modules,
  activeId,
}: {
  modules: readonly { id: string; label: string }[];
  activeId: string | null;
}) {
  return (
    <div className="pp-why-spine" aria-hidden>
      <div className={`pp-why-spine-hub${activeId ? "" : " is-pulse"}`}>
        <span className="pp-why-spine-hub-label">MemberCore</span>
        <span className="pp-why-spine-hub-meta">One record</span>
      </div>
      <ul className="pp-why-spine-spokes">
        {modules.map((mod, i) => (
          <li
            key={mod.id}
            className={`pp-why-spine-spoke${activeId === mod.id ? " is-active" : ""}`}
            style={{ "--spoke-i": i } as CSSProperties}
          >
            <span className="pp-why-spine-dot" />
            <span className="pp-why-spine-spoke-label">{mod.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
