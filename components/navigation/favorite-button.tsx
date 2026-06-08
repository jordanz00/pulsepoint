"use client";

import { Star } from "lucide-react";
import { useNavPreferences } from "@/components/navigation/nav-preferences-provider";

export function FavoriteButton({
  id,
  href,
  label,
}: {
  id: string;
  href: string;
  label: string;
}) {
  const { isFavorite, toggleFavorite } = useNavPreferences();
  const active = isFavorite(id);

  return (
    <button
      type="button"
      className={`pp-nav-favorite${active ? " pp-nav-favorite--active" : ""}`}
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ id, href, label });
      }}
    >
      <Star size={14} fill={active ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
