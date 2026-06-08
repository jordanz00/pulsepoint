/**
 * URL allowlist helper — SSRF defense.
 *
 * WHO THIS IS FOR: any outbound fetch (PulsePoint client today; future webhooks).
 * WHAT IT DOES: Validates a URL against an allowlist of origins and (in production)
 *   blocks localhost / RFC1918 / link-local destinations.
 * HOW IT CONNECTS: Used by api/src/services/pulsepoint-client.ts before fetch().
 *   See SECURE-FORCE.md: "Fetch unvalidated URLs" is one of the AI-generated
 *   red flags; every outbound fetch MUST go through a checker like this.
 */

const PRIVATE_IP_PREFIXES = [
  "10.",
  "127.",
  "169.254.",
  "192.168.",
];

/**
 * Reject literal IPs that fall into RFC1918 / loopback / link-local ranges.
 *
 * Note: this is a string-prefix check, not a full CIDR parser; it covers the
 * common SSRF cases that AI-generated code typically misses. For full CIDR
 * coverage (e.g. 172.16/12) we also check the 172.16-31 range explicitly.
 */
function isPrivateOrLoopback(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "::1") return true;
  if (PRIVATE_IP_PREFIXES.some((p) => lower.startsWith(p))) return true;
  // 172.16.0.0/12 — 172.16.x.x through 172.31.x.x
  const m = /^172\.(\d{1,3})\./.exec(lower);
  if (m) {
    const second = parseInt(m[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export interface UrlAllowlistOptions {
  /** Origins (scheme://host[:port]) permitted for outbound fetch. */
  allowedOrigins: string[];
  /**
   * If true, reject http:// and any private/loopback hostnames.
   * Typically tied to NODE_ENV === "production".
   */
  enforceProductionRules: boolean;
}

/**
 * Validate that an outbound URL is safe to fetch.
 *
 * WHO THIS IS FOR: any service calling fetch() with a configurable destination.
 * WHAT IT DOES:
 *   1. Parses the URL — invalid URLs return false.
 *   2. In production rules: requires https.
 *   3. Requires the URL's origin to appear in `allowedOrigins`.
 *   4. In production rules: rejects localhost / RFC1918 / link-local hosts.
 *
 * @param raw the URL string to check
 * @param opts allowlist + enforcement mode
 * @returns true if the URL passes all checks
 */
export function isAllowedEndpoint(raw: string, opts: UrlAllowlistOptions): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (opts.enforceProductionRules && url.protocol !== "https:") return false;
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  if (opts.enforceProductionRules && isPrivateOrLoopback(url.hostname)) {
    return false;
  }

  const candidateOrigin = url.origin;
  const allowed = opts.allowedOrigins.some((origin) => {
    try {
      return new URL(origin).origin === candidateOrigin;
    } catch {
      return false;
    }
  });

  return allowed;
}
