"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadFavorites,
  loadRecent,
  toggleFavorite as toggleFavoriteStore,
  type NavFavoriteItem,
  type NavRecentItem,
} from "@/lib/navigation/preferences";

type NavPreferencesContextValue = {
  favorites: NavFavoriteItem[];
  recent: NavRecentItem[];
  refresh: () => void;
  toggleFavorite: (item: NavFavoriteItem) => void;
  isFavorite: (id: string) => boolean;
};

const NavPreferencesContext = createContext<NavPreferencesContextValue | null>(null);

export function NavPreferencesProvider({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: ReactNode;
}) {
  const [favorites, setFavorites] = useState<NavFavoriteItem[]>([]);
  const [recent, setRecent] = useState<NavRecentItem[]>([]);

  const refresh = useCallback(() => {
    setFavorites(loadFavorites(orgSlug));
    setRecent(loadRecent(orgSlug));
  }, [orgSlug]);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (!e.key?.includes(orgSlug)) return;
      refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pp-nav-preferences", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pp-nav-preferences", refresh);
    };
  }, [orgSlug, refresh]);

  const toggleFavorite = useCallback(
    (item: NavFavoriteItem) => {
      const next = toggleFavoriteStore(orgSlug, item);
      setFavorites(next);
      window.dispatchEvent(new Event("pp-nav-preferences"));
    },
    [orgSlug],
  );

  const value = useMemo(
    () => ({
      favorites,
      recent,
      refresh,
      toggleFavorite,
      isFavorite: (id: string) => favorites.some((f) => f.id === id),
    }),
    [favorites, recent, refresh, toggleFavorite],
  );

  return (
    <NavPreferencesContext.Provider value={value}>{children}</NavPreferencesContext.Provider>
  );
}

export function useNavPreferences() {
  const ctx = useContext(NavPreferencesContext);
  if (!ctx) {
    throw new Error("useNavPreferences requires NavPreferencesProvider");
  }
  return ctx;
}
