/**
 * Community document links — https-only in production; http allowed in dev for local files.
 */

export function isAllowedCommunityDocumentUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol === "https:") return true;
    if (process.env.NODE_ENV === "development" && url.protocol === "http:") return true;
    return false;
  } catch {
    return false;
  }
}
