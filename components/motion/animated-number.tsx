"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export type AnimatedNumberProps = {
  value: number;
  /** ms */
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

export function AnimatedNumber({
  value,
  duration = 1100,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedNumberProps) {
  const reduced = usePrefersReducedMotion();
  const [displayed, setDisplayed] = useState(reduced ? value : 0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setDisplayed(value);
      return;
    }
    startRef.current = null;

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const next = easeOutQuart(progress) * value;
      setDisplayed(next);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, reduced]);

  const formatted =
    decimals > 0
      ? displayed.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(displayed).toLocaleString();

  const rootClass = ["mk-stat-number", className].filter(Boolean).join(" ");

  return (
    <span className={rootClass} aria-live="polite">
      {prefix ? <span className="mk-stat-prefix">{prefix}</span> : null}
      <span className="mk-stat-digits">{formatted}</span>
      {suffix ? <span className="mk-stat-suffix">{suffix}</span> : null}
    </span>
  );
}
