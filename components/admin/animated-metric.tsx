"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedMetricProps = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  /** 0–100 ring fill percentage. Omit to skip ring. */
  ring?: number;
  ringColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function AnimatedMetric({
  value,
  label,
  prefix = "",
  suffix = "",
  ring,
  ringColor = "var(--pp-accent-blue)",
  size = "md",
  className = "",
}: AnimatedMetricProps) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const duration = 1200;

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(value);
      return;
    }
    startRef.current = null;

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(easeOutQuart(progress) * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, prefersReduced]);

  const sizeClass =
    size === "lg"
      ? "pp-animated-metric--lg"
      : size === "sm"
        ? "pp-animated-metric--sm"
        : "pp-animated-metric--md";

  const circumference = 2 * Math.PI * 36;
  const dashOffset = ring !== undefined ? circumference * (1 - ring / 100) : 0;

  return (
    <div className={`pp-animated-metric ${sizeClass} ${className}`}>
      {ring !== undefined && (
        <div className="pp-metric-ring-wrap" aria-hidden="true">
          <svg viewBox="0 0 80 80" className="pp-metric-ring-svg">
            <circle cx="40" cy="40" r="36" className="pp-metric-ring-track" />
            <circle
              cx="40"
              cy="40"
              r="36"
              className="pp-metric-ring-fill"
              style={{
                stroke: ringColor,
                strokeDasharray: circumference,
                strokeDashoffset: prefersReduced ? circumference * (1 - ring / 100) : dashOffset,
                transition: prefersReduced ? "none" : `stroke-dashoffset ${duration}ms cubic-bezier(0.165, 0.84, 0.44, 1)`,
              }}
            />
          </svg>
          <span className="pp-metric-ring-inner">
            <span className="pp-metric-ring-value">
              {prefix}{displayed.toLocaleString()}{suffix}
            </span>
          </span>
        </div>
      )}
      {ring === undefined && (
        <p className="pp-metric-plain-value" aria-live="polite">
          {prefix}{displayed.toLocaleString()}{suffix}
        </p>
      )}
      <p className="pp-metric-label">{label}</p>
    </div>
  );
}
