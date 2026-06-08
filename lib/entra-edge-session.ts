/**
 * Entra session verification for Edge middleware (Web Crypto).
 *
 * Mirrors lib/entra-session.ts verify logic without node:crypto.
 */

export const ENTRA_SESSION_COOKIE = "pp_entra_session";

type EntraSessionPayload = {
  v: number;
  exp: number;
};

function base64urlToBytes(s: string): Uint8Array | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const std = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const binary = atob(std);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/**
 * Verify signed Entra session cookie on the Edge runtime.
 */
export async function verifyEntraSessionEdge(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret || secret.length < 32) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const jsonBytes = base64urlToBytes(parts[0]!);
  const sigBytes = base64urlToBytes(parts[1]!);
  if (!jsonBytes || !sigBytes) return false;

  const json = new TextDecoder().decode(jsonBytes);
  let payload: EntraSessionPayload;
  try {
    payload = JSON.parse(json) as EntraSessionPayload;
  } catch {
    return false;
  }
  if (payload.v !== 1 || typeof payload.exp !== "number") return false;
  if (payload.exp < Math.floor(Date.now() / 1000)) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(json)),
  );
  return timingSafeEqual(sigBytes, expected);
}
