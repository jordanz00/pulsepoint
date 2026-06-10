"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NAV_GROUP_LABELS,
  NAV_GROUP_ORDER,
  type AdminNavGroup,
  type AdminNavItem,
} from "@/lib/nav-config";
import type { AdminNavCounts } from "@/lib/admin-nav-counts";
import { adminNavIcon } from "@/lib/admin-nav-icons";

function isActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0]!;
  if (pathname === path) return true;
  const segments = path.split("/").filter(Boolean);
  if (segments.length <= 2) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavBadge({
  item,
  counts,
}: {
  item: AdminNavItem;
  counts: AdminNavCounts;
}) {
  if (item.status === "alpha" || item.status === "roadmap") {
    return (
      <span
        className="nav-alpha-dot"
        title="Preview module"
        aria-label="Preview module"
      />
    );
  }
  if (item.id === "members" && counts.members > 0) {
    return <span className="nav-badge-count">{counts.members}</span>;
  }
  if (item.id === "events" && counts.events > 0) {
    return <span className="nav-badge-count">{counts.events}</span>;
  }
  if (item.id === "exceptions" && counts.exceptions > 0) {
    return (
      <span className="nav-badge-count nav-badge-count--danger">
        {counts.exceptions}
      </span>
    );
  }
  return null;
}

function NavSection({
  group,
  items,
  pathname,
  counts,
}: {
  group: AdminNavGroup;
  items: AdminNavItem[];
  pathname: string;
  counts: AdminNavCounts;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="pp-sidebar-section">{NAV_GROUP_LABELS[group]}</p>
      <nav aria-label={NAV_GROUP_LABELS[group]}>
        {items.map((item) => {
          if (item.status === "roadmap") {
            return (
              <span
                key={item.id}
                className="nav-item"
                style={{ opacity: 0.5, cursor: "not-allowed" }}
                title="Coming soon"
                aria-disabled
              >
                {(() => {
                  const Icon = adminNavIcon(item.iconId);
                  return <Icon size={16} aria-hidden />;
                })()}
                <span className="pp-nav-item-label">{item.name}</span>
              </span>
            );
          }
          const active = isActive(pathname, item.href);
          const Icon = adminNavIcon(item.iconId);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={16} aria-hidden />
              <span className="pp-nav-item-label">{item.name}</span>
              <NavBadge item={item} counts={counts} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppSidebar({
  orgSlug,
  orgName,
  orgLogoUrl,
  nav,
  counts,
}: {
  orgSlug: string;
  orgName: string;
  orgLogoUrl?: string | null;
  nav: AdminNavItem[];
  counts: AdminNavCounts;
}) {
  const pathname = usePathname();
  const initials = orgName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const groups: AdminNavGroup[] = NAV_GROUP_ORDER;

  return (
    <aside className="pp-sidebar glass" aria-label="Main navigation">
      <div className="pp-sidebar-org">
        {orgLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={orgLogoUrl}
            alt=""
            width={24}
            height={24}
            className="pp-sidebar-org-mark"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="pp-sidebar-org-mark" aria-hidden>
            {initials || "PP"}
          </span>
        )}
        <span
          className="min-w-0 truncate text-[12px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {orgName}
        </span>
      </div>

      {groups.map((group) => (
        <NavSection
          key={group}
          group={group}
          items={nav.filter((n) => n.group === group)}
          pathname={pathname}
          counts={counts}
        />
      ))}

      <p className="pp-sidebar-foot">PulsePoint v0.1</p>
    </aside>
  );
}
