"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { AdminNavItem } from "@/lib/nav-config";
import { labelForPath } from "@/lib/navigation/search-index";
import { recordRecent } from "@/lib/navigation/preferences";

export function RecentTracker({
  orgSlug,
  nav,
}: {
  orgSlug: string;
  nav: AdminNavItem[];
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.includes(orgSlug)) return;
    const label = labelForPath(pathname, orgSlug, nav);
    recordRecent(orgSlug, pathname, label);
    window.dispatchEvent(new Event("pp-nav-preferences"));
  }, [pathname, orgSlug, nav]);

  return null;
}
