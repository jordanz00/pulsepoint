"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  LayoutDashboard,
  MoreHorizontal,
  Users,
} from "lucide-react";
import type { AdminNavItem } from "@/lib/nav-config";

const CORE_TABS = [
  { id: "work", label: "Overview", icon: LayoutDashboard, suffix: "" },
  { id: "members", label: "Members", icon: Users, suffix: "/members" },
  { id: "events", label: "Events", icon: Calendar, suffix: "/events" },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle, suffix: "/exceptions" },
] as const;

export function BottomTabBar({
  orgSlug,
  extraNav,
}: {
  orgSlug: string;
  extraNav: AdminNavItem[];
}) {
  const pathname = usePathname();
  const base = `/${orgSlug}`;
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {moreOpen ? (
        <div
          className="slideover-backdrop"
          role="presentation"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="slideover-panel glass"
            style={{ top: "auto", height: "min(70vh, 480px)", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="slideover-head">
              <span className="page-title">More</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setMoreOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="slideover-body">
              {extraNav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="nav-item"
                  onClick={() => setMoreOpen(false)}
                >
                  {item.name}
                  {item.status === "alpha" ? (
                    <span className="badge-alpha">Preview</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="pp-bottom-tabs glass" aria-label="Mobile navigation">
        {CORE_TABS.map((tab) => {
          const href = `${base}${tab.suffix}`;
          const active =
            tab.suffix === ""
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={href}
              className={`pp-bottom-tab${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} aria-hidden />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`pp-bottom-tab${moreOpen ? " active" : ""}`}
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={20} aria-hidden />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
