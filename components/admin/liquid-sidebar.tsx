"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { FavoriteButton } from "@/components/navigation/favorite-button";
import { useNavPreferences } from "@/components/navigation/nav-preferences-provider";
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
    return <span className="pp-nav-alpha-dot" title="Preview" aria-label="Preview module" />;
  }
  if (item.id === "members") {
    return <span className="pp-nav-count-badge">{counts.members}</span>;
  }
  if (item.id === "events") {
    return <span className="pp-nav-count-badge">{counts.events}</span>;
  }
  if (item.id === "exceptions" && counts.exceptions > 0) {
    return (
      <span className="pp-nav-count-badge pp-nav-count-badge--danger">
        {counts.exceptions}
      </span>
    );
  }
  return null;
}

function NavItemRow({
  item,
  active,
  counts,
}: {
  item: AdminNavItem;
  active: boolean;
  counts: AdminNavCounts;
}) {
  const Icon = adminNavIcon(item.iconId);

  if (item.status === "roadmap") {
    return (
      <span
        className="pp-nav-item pp-nav-item--roadmap"
        title="Coming in a future release"
        aria-disabled
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
        <span>{item.name}</span>
        <span className="pp-nav-roadmap-dot" aria-hidden />
      </span>
    );
  }

  return (
    <div className={`pp-nav-item-wrap${active ? " pp-nav-item-wrap--active" : ""}`}>
      <Link
        href={item.href}
        className={`pp-nav-item${active ? " pp-nav-item--active" : ""}`}
        aria-current={active ? "page" : undefined}
        title={item.status === "alpha" ? `${item.name} (Alpha)` : item.description}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
        <span className="pp-nav-item-label">{item.name}</span>
        <NavBadge item={item} counts={counts} />
      </Link>
      <FavoriteButton id={item.id} href={item.href} label={item.name} />
    </div>
  );
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
    <div className="pp-nav-section">
      <p className="pp-nav-section-label">{NAV_GROUP_LABELS[group]}</p>
      <ul className="pp-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <NavItemRow
              item={item}
              active={isActive(pathname, item.href)}
              counts={counts}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FavoritesSection({ pathname }: { pathname: string }) {
  const { favorites } = useNavPreferences();
  if (favorites.length === 0) return null;

  return (
    <div className="pp-nav-section pp-nav-section--favorites">
      <p className="pp-nav-section-label">
        <Star size={12} aria-hidden />
        Favorites
      </p>
      <ul className="pp-nav-list">
        {favorites.map((f) => {
          const active = isActive(pathname, f.href);
          return (
            <li key={f.id}>
              <div className={`pp-nav-item-wrap${active ? " pp-nav-item-wrap--active" : ""}`}>
                <Link
                  href={f.href}
                  className={`pp-nav-item pp-nav-item--favorite${active ? " pp-nav-item--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Star size={16} fill="currentColor" aria-hidden />
                  <span className="pp-nav-item-label">{f.label}</span>
                </Link>
                <FavoriteButton id={f.id} href={f.href} label={f.label} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LiquidSidebar({
  orgSlug,
  orgName,
  nav,
  counts,
}: {
  orgSlug: string;
  orgName: string;
  nav: AdminNavItem[];
  counts: AdminNavCounts;
}) {
  const pathname = usePathname();
  const byGroup = Object.fromEntries(
    NAV_GROUP_ORDER.map((g) => [g, nav.filter((n) => n.group === g)]),
  ) as Record<AdminNavGroup, AdminNavItem[]>;

  return (
    <aside className="pp-liquid-sidebar glass">
      <Link href={`/${orgSlug}`} className="pp-sidebar-brand" title={orgName}>
        <BrandLogo size="sm" />
        <span className="pp-sidebar-brand-name pp-sidebar-brand-name--org">
          {orgName}
        </span>
      </Link>
      <nav className="pp-liquid-sidebar-nav" aria-label="Main menu">
        <FavoritesSection pathname={pathname} />
        {NAV_GROUP_ORDER.map((group) => (
          <NavSection
            key={group}
            group={group}
            items={byGroup[group]}
            pathname={pathname}
            counts={counts}
          />
        ))}
      </nav>
    </aside>
  );
}
