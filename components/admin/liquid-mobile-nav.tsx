"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import type { AdminNavItem } from "@/lib/nav-config";

export function LiquidMobileNav({
  orgSlug,
  nav,
  onOpenSearch,
}: {
  orgSlug: string;
  nav: AdminNavItem[];
  onOpenSearch?: () => void;
}) {
  const pathname = usePathname();
  const base = `/${orgSlug}`;

  const intelligence = nav.find((n) => n.id === "intelligence");

  const tabs = [
    { id: "overview", href: base, icon: LayoutDashboard, label: "Home" },
    { id: "members", href: `${base}/members`, icon: Users, label: "Members" },
    { id: "events", href: `${base}/events`, icon: CalendarDays, label: "Events" },
    {
      id: "intelligence",
      href: intelligence?.href ?? `${base}/intelligence`,
      icon: Sparkles,
      label: "Intel",
    },
  ] as const;

  return (
    <nav className="pp-liquid-mobile-nav glass" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const active =
          tab.id === "overview"
            ? pathname === base
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`pp-liquid-mobile-tab${active ? " pp-liquid-mobile-tab--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden />
            <span>{tab.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        className="pp-liquid-mobile-tab pp-liquid-mobile-tab--search"
        aria-label="Open search"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("pp-open-command-palette"));
          onOpenSearch?.();
        }}
      >
        <Search size={20} strokeWidth={1.75} aria-hidden />
        <span>Search</span>
      </button>
    </nav>
  );
}
