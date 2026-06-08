/**
 * Advocacy issue media allowlist — hero images and toolkit paths only from approved locations.
 */

const TOOLKIT_PREFIX = "/advocacy-toolkits/";
const HERO_IMAGE_PREFIX = "/advocacy-toolkits/";

const SAFE_PATH = /^\/[a-z0-9/-]+\.(html|svg|png|webp)$/i;

/** Public toolkit page (print-to-PDF) — must live under /advocacy-toolkits/. */
export function resolveToolkitPath(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const path = raw.trim().startsWith("/") ? raw.trim() : `/${raw.trim()}`;
  if (!path.startsWith(TOOLKIT_PREFIX) || !SAFE_PATH.test(path)) return null;
  return path;
}

/** Hero still image — local assets under /advocacy-toolkits/ only. */
export function resolveHeroImagePath(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const path = raw.trim().startsWith("/") ? raw.trim() : `/${raw.trim()}`;
  if (!path.startsWith(HERO_IMAGE_PREFIX) || !SAFE_PATH.test(path)) return null;
  return path;
}
