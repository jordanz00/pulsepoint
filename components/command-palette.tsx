"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Search,
  Star,
  Zap,
} from "lucide-react";
import {
  searchCommittees,
  searchEvents,
  searchMembers,
} from "@/app/actions/command-search";
import { useNavPreferences } from "@/components/navigation/nav-preferences-provider";
import type { AdminNavItem } from "@/lib/nav-config";
import { recordRecent } from "@/lib/navigation/preferences";
import {
  buildNavigationSearchIndex,
  filterSearchIndex,
  type SearchIndexItem,
} from "@/lib/navigation/search-index";
import { adminNavIcon } from "@/lib/admin-nav-icons";

type PaletteRow = SearchIndexItem & {
  meta?: string;
  kind: "static" | "member" | "event" | "committee" | "favorite" | "recent";
};

type CommandPaletteProps = {
  orgSlug: string;
  nav: AdminNavItem[];
  open: boolean;
  onClose: () => void;
};

export function trackRecentPage(href: string, orgSlug: string, label: string) {
  recordRecent(orgSlug, href, label);
  window.dispatchEvent(new Event("pp-nav-preferences"));
}

export function CommandPalette({ orgSlug, nav, open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [entityHits, setEntityHits] = useState<PaletteRow[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { favorites, recent } = useNavPreferences();

  const staticIndex = useMemo(
    () => buildNavigationSearchIndex(orgSlug, nav),
    [orgSlug, nav],
  );

  const favoriteRows: PaletteRow[] = useMemo(
    () =>
      favorites.map((f) => ({
        id: `fav-${f.id}`,
        label: f.label,
        href: f.href,
        section: "Favorites",
        keywords: [],
        kind: "favorite" as const,
      })),
    [favorites],
  );

  const recentRows: PaletteRow[] = useMemo(
    () =>
      recent.map((r) => ({
        id: `recent-${r.href}`,
        label: r.label,
        href: r.href,
        section: "Recently viewed",
        keywords: [],
        kind: "recent" as const,
      })),
    [recent],
  );

  const staticRows: PaletteRow[] = useMemo(() => {
    const q = query.trim();
    const filtered = q ? filterSearchIndex(staticIndex, q) : staticIndex;
    return filtered.map((item) => ({ ...item, kind: "static" as const }));
  }, [staticIndex, query]);

  const allItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const favs = q
      ? favoriteRows.filter((f) => f.label.toLowerCase().includes(q))
      : favoriteRows;
    const rec = q
      ? recentRows.filter((r) => r.label.toLowerCase().includes(q))
      : recentRows;

    if (q.length >= 2) {
      return [...favs, ...rec, ...staticRows.slice(0, 12), ...entityHits];
    }

    const quick = staticRows.filter((s) => s.section === "Quick actions").slice(0, 6);
    const shortcuts = staticRows.filter((s) => s.section === "Shortcuts").slice(0, 4);
    const pages = q ? staticRows.filter((s) => s.section === "Pages") : [];

    return [...favs, ...rec, ...quick, ...shortcuts, ...pages];
  }, [query, favoriteRows, recentRows, staticRows, entityHits]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setEntityHits([]);
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setEntityHits([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const [membersRes, eventsRes, committeesRes] = await Promise.all([
        searchMembers(orgSlug, q),
        searchEvents(orgSlug, q),
        searchCommittees(orgSlug, q),
      ]);
      if (cancelled) return;
      const hits: PaletteRow[] = [];
      const base = `/${orgSlug}`;

      if (membersRes.ok && membersRes.data) {
        for (const m of membersRes.data.members) {
          hits.push({
            id: m.id,
            label: `${m.firstName} ${m.lastName}`.trim(),
            description: m.email ?? undefined,
            href: `${base}/members/${m.id}`,
            section: "Members",
            keywords: [],
            meta: m.status,
            kind: "member",
          });
        }
      }
      if (eventsRes.ok && eventsRes.data) {
        for (const e of eventsRes.data.events) {
          hits.push({
            id: e.id,
            label: e.title,
            href: `${base}/events/${e.id}`,
            section: "Events",
            keywords: [],
            meta: e.status,
            kind: "event",
          });
        }
      }
      if (committeesRes.ok && committeesRes.data) {
        for (const c of committeesRes.data.committees) {
          hits.push({
            id: c.id,
            label: c.name,
            href: `${base}/committees`,
            section: "Committees",
            keywords: [],
            kind: "committee",
          });
        }
      }
      setEntityHits(hits);
      setLoading(false);
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, orgSlug, open]);

  const selectItem = useCallback(
    (item: PaletteRow) => {
      trackRecentPage(item.href, orgSlug, item.label);
      onClose();
      router.push(item.href);
    },
    [onClose, orgSlug, router],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, allItems.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && allItems[activeIndex]) {
        e.preventDefault();
        selectItem(allItems[activeIndex]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, allItems, activeIndex, onClose, selectItem]);

  if (!open) return null;

  let lastSection = "";

  function rowIcon(item: PaletteRow) {
    if (item.kind === "favorite") return Star;
    if (item.kind === "recent") return Clock;
    if (item.section === "Quick actions" || item.section === "Shortcuts") return Zap;
    const navItem = nav.find((n) => item.favoriteId === n.id || item.id === `nav-${n.id}`);
    if (navItem) return adminNavIcon(navItem.iconId);
    return Search;
  }

  return (
    <div
      className="command-palette-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="command-palette glass glass-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Global search and command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="command-palette__input-row">
          <Search size={18} className="command-palette__search-icon" aria-hidden />
          <input
            ref={inputRef}
            className="command-palette-input"
            placeholder="Search pages, members, events, actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
          />
          {loading ? (
            <span className="command-palette__loading" aria-live="polite">
              Searching…
            </span>
          ) : (
            <kbd className="command-palette__hint">esc</kbd>
          )}
        </div>
        <div id="command-palette-results" className="command-palette-results" role="listbox">
          {allItems.length === 0 ? (
            <div className="command-palette__empty">
              <p className="command-palette__empty-title">
                {query.trim() ? `No results for “${query.trim()}”` : "Start typing to search"}
              </p>
              <p className="command-palette__empty-desc">
                Members, events, committees, pages, and quick actions.
              </p>
            </div>
          ) : (
            allItems.map((item, index) => {
              const showHeader = item.section !== lastSection;
              lastSection = item.section;
              const Icon = rowIcon(item);
              const selected = index === activeIndex;
              return (
                <div key={`${item.section}-${item.id}`}>
                  {showHeader ? (
                    <p className="command-palette-section">{item.section}</p>
                  ) : null}
                  <button
                    type="button"
                    className={`command-palette-item${selected ? " command-palette-item--active" : ""}`}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectItem(item)}
                  >
                    <Icon size={16} aria-hidden />
                    <span className="command-palette-item__label">
                      <span>{item.label}</span>
                      {item.description ? (
                        <span className="command-palette-item__desc">{item.description}</span>
                      ) : null}
                    </span>
                    {item.shortcut ? (
                      <kbd className="command-palette-item__kbd">{item.shortcut}</kbd>
                    ) : null}
                    {item.meta ? (
                      <span className="command-palette-item-meta">{item.meta}</span>
                    ) : null}
                    <ArrowRight size={14} className="command-palette-item-meta" aria-hidden />
                  </button>
                </div>
              );
            })
          )}
        </div>
        <footer className="command-palette__footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>⌘K anytime</span>
        </footer>
      </div>
    </div>
  );
}
