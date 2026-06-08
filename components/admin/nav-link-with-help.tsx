"use client";

import Link from "next/link";
import type { AdminNavItem } from "@/lib/nav-config";
import { adminNavIcon } from "@/lib/admin-nav-icons";

export function NavLinkWithHelp({
  item,
  active,
}: {
  item: AdminNavItem;
  active: boolean;
  showHelp?: boolean;
  simple?: boolean;
}) {
  const Icon = adminNavIcon(item.iconId);
  return (
    <Link
      href={item.href}
      className={`pc-sidebar-link${active ? " pc-sidebar-link-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden />
      <span>{item.name}</span>
    </Link>
  );
}
