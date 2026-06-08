"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PORTAL_HUB_SECTIONS } from "@/lib/portal/portal-nav-config";

export function PortalQuickNav({ orgSlug }: { orgSlug: string }) {
  const [active, setActive] = useState<string>("membership");

  useEffect(() => {
    const sections = PORTAL_HUB_SECTIONS.map((s) => s.sectionId).filter(Boolean) as string[];
    const observers: IntersectionObserver[] = [];

    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="portal-quick-nav" aria-label="Jump to section">
      <div className="portal-quick-nav__track">
        {PORTAL_HUB_SECTIONS.map((item) => {
          const id = item.sectionId ?? item.id;
          const isActive = active === id;
          return (
            <Link
              key={item.id}
              href={item.href(orgSlug)}
              className={`portal-quick-nav__pill${isActive ? " portal-quick-nav__pill--active" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
