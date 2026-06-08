/**
 * Unified navigation search index — pages, shortcuts, and searchable entities.
 */
import type { AdminNavItem } from "@/lib/nav-config";
import { buildNavShortcuts } from "@/lib/navigation/shortcuts";

export type SearchIndexItem = {
  id: string;
  label: string;
  description?: string;
  href: string;
  section: string;
  keywords: string[];
  shortcut?: string;
  favoriteId?: string;
};

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,/]+/).filter(Boolean);
}

export function buildNavigationSearchIndex(
  orgSlug: string,
  nav: AdminNavItem[],
): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  for (const n of nav) {
    items.push({
      id: `nav-${n.id}`,
      label: n.name,
      description: n.description,
      href: n.href,
      section: "Pages",
      keywords: [...tokenize(n.name), ...tokenize(n.description), n.id],
      favoriteId: n.id,
    });
  }

  for (const s of buildNavShortcuts(orgSlug)) {
    items.push({
      id: `shortcut-${s.id}`,
      label: s.label,
      description: s.description,
      href: s.href(orgSlug),
      section: s.section === "actions" ? "Quick actions" : "Shortcuts",
      keywords: [...s.keywords, ...tokenize(s.label)],
      shortcut: s.shortcut,
      favoriteId: s.id,
    });
  }

  return items;
}

export function filterSearchIndex(
  items: SearchIndexItem[],
  query: string,
): SearchIndexItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const haystack = [
      item.label,
      item.description ?? "",
      item.section,
      ...item.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function labelForPath(
  pathname: string,
  orgSlug: string,
  nav: AdminNavItem[],
): string {
  const base = `/${orgSlug}`;
  if (pathname === base || pathname === `${base}/`) return "Overview";
  const match = nav.find((n) => {
    const path = n.href.split("?")[0]!;
    return pathname === path || pathname.startsWith(`${path}/`);
  });
  if (match) return match.name;
  const tail = pathname.replace(base, "").replace(/^\//, "");
  if (!tail) return "Overview";
  return tail.split("/").map((s) => s.replace(/-/g, " ")).join(" · ");
}
