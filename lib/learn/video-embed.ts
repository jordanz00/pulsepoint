/**
 * Safe video embed parsing — YouTube and Vimeo only (no arbitrary iframe src).
 */

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export type ParsedVideoEmbed = {
  embedUrl: string;
  provider: "youtube" | "vimeo";
};

/** Normalize user paste (watch URL or embed URL) to a safe embed src. */
export function parseVideoEmbedUrl(raw: string): ParsedVideoEmbed | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0] ?? "";
      if (!YOUTUBE_ID.test(id)) return null;
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      };
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      let id = url.searchParams.get("v") ?? "";
      if (!id && url.pathname.startsWith("/embed/")) {
        id = url.pathname.split("/")[2] ?? "";
      }
      if (!YOUTUBE_ID.test(id)) return null;
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      };
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = host === "vimeo.com" ? parts[0] : parts[1] ?? parts[0];
      if (!id || !/^\d+$/.test(id)) return null;
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${id}`,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function workforceTrackLabel(slug: string): string {
  const labels: Record<string, string> = {
    nursing: "Nursing",
    "allied-health": "Allied health",
    physician: "Physician",
    "advocacy-101": "Advocacy 101",
    general: "General",
  };
  return labels[slug] ?? slug;
}
