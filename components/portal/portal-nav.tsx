"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_TOP_NAV } from "@/lib/portal/portal-nav-config";

export function PortalNav({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname();
  const base = `/${orgSlug}/portal`;
  const primary = PORTAL_TOP_NAV.filter((item) =>
    ["home", "communities", "store"].includes(item.id),
  );

  function isActive(id: string, href: string) {
    if (id === "home") return pathname === base || pathname === `${base}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav aria-label="Member portal" className="portal-top-nav">
      {primary.map((item) => {
        const href = item.href(orgSlug);
        const active = isActive(item.id, href);
        return (
          <Link
            key={item.id}
            href={href}
            className={`portal-top-nav__link${active ? " portal-top-nav__link--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
