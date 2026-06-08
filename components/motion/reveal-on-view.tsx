"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function RevealOnView({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  /** Start visible so SSR / first paint is never an empty page */
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    if (isInViewport(el)) {
      setVisible(true);
      return;
    }

    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const cls = `pp-reveal ${visible ? "pp-reveal--visible" : ""} ${className}`.trim();

  return (
    <div
      ref={ref}
      className={cls}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function RevealStagger({
  children,
  className = "",
  staggerMs = 70,
}: {
  children: ReactNode[];
  className?: string;
  staggerMs?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <RevealOnView key={i} delayMs={i * staggerMs}>
          {child}
        </RevealOnView>
      ))}
    </div>
  );
}
