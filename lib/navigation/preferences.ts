/**
 * Client-side navigation preferences — favorites & recently viewed (per org).
 */

export type NavRecentItem = {
  href: string;
  label: string;
  visitedAt: number;
};

export type NavFavoriteItem = {
  id: string;
  href: string;
  label: string;
};

const RECENT_PREFIX = "pp-nav-recent";
const FAVORITES_PREFIX = "pp-nav-favorites";
const MAX_RECENT = 8;
const MAX_FAVORITES = 12;

function recentKey(orgSlug: string) {
  return `${RECENT_PREFIX}:${orgSlug}`;
}

function favoritesKey(orgSlug: string) {
  return `${FAVORITES_PREFIX}:${orgSlug}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadRecent(orgSlug: string): NavRecentItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<NavRecentItem[]>(localStorage.getItem(recentKey(orgSlug)), []);
}

export function recordRecent(orgSlug: string, href: string, label: string) {
  if (typeof window === "undefined" || !href.includes(orgSlug)) return;
  const list = loadRecent(orgSlug).filter((r) => r.href !== href);
  list.unshift({ href, label, visitedAt: Date.now() });
  localStorage.setItem(recentKey(orgSlug), JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function loadFavorites(orgSlug: string): NavFavoriteItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<NavFavoriteItem[]>(localStorage.getItem(favoritesKey(orgSlug)), []);
}

export function saveFavorites(orgSlug: string, items: NavFavoriteItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(favoritesKey(orgSlug), JSON.stringify(items.slice(0, MAX_FAVORITES)));
}

export function toggleFavorite(
  orgSlug: string,
  item: NavFavoriteItem,
): NavFavoriteItem[] {
  const current = loadFavorites(orgSlug);
  const exists = current.some((f) => f.id === item.id);
  const next = exists
    ? current.filter((f) => f.id !== item.id)
    : [item, ...current];
  saveFavorites(orgSlug, next);
  return next;
}

export function isFavorite(orgSlug: string, id: string): boolean {
  return loadFavorites(orgSlug).some((f) => f.id === id);
}
