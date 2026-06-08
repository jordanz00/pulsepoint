"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Re-triggers route enter animation when admin pathname changes.
 */
export function RouteTransitionContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="pp-route-transition-pane">
      {children}
    </div>
  );
}
