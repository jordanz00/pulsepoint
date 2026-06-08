/**
 * Signed HTTP-only session cookie for Microsoft Entra pilot auth.
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { OrgRole } from "@/app/generated/prisma/client";

export const ENTRA_SESSION_COOKIE = "pp_entra_session";
export const ENTRA_PKCE_COOKIE = "pp_entra_pkce";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export type EntraSessionPayload = {
  v: 1;
  exp: number;
  entraOid: string;
  email: string;
  name: string | null;
  userId: string;
  orgId: string;
  orgSlug: string;
  role: OrgRole;
};

function getSecret(): string {
  const s = process.env.ENTRA_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ENTRA_SESSION_SECRET missing or too short (>=32 chars).");
  }
  return s;
}

function base64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signEntraSession(payload: Omit<EntraSessionPayload, "v" | "exp">): string {
  const body: EntraSessionPayload = {
    v: 1,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
    ...payload,
  };
  const json = JSON.stringify(body);
  const sig = crypto.createHmac("sha256", getSecret()).update(json).digest();
  return `${base64url(json)}.${base64url(sig)}`;
}

export function verifyEntraSession(token: string): EntraSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [bodyB64, sigB64] = parts;
  let json: string;
  try {
    json = base64urlDecode(bodyB64).toString("utf8");
  } catch {
    return null;
  }
  const expected = crypto.createHmac("sha256", getSecret()).update(json).digest();
  const got = base64urlDecode(sigB64);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) {
    return null;
  }
  let payload: EntraSessionPayload;
  try {
    payload = JSON.parse(json) as EntraSessionPayload;
  } catch {
    return null;
  }
  if (payload.v !== 1 || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

export async function getEntraSession(): Promise<EntraSessionPayload | null> {
  if (!process.env.ENTRA_SESSION_SECRET) return null;
  const jar = await cookies();
  const raw = jar.get(ENTRA_SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifyEntraSession(raw);
}

export async function setEntraSessionCookie(payload: Omit<EntraSessionPayload, "v" | "exp">) {
  const jar = await cookies();
  jar.set(ENTRA_SESSION_COOKIE, signEntraSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearEntraSessionCookie() {
  const jar = await cookies();
  jar.delete(ENTRA_SESSION_COOKIE);
}

export type PkceState = {
  verifier: string;
  state: string;
  returnTo: string;
};

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest(),
  );
  return { verifier, challenge };
}

export function signPkceState(data: PkceState): string {
  const json = JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + 600 });
  const sig = crypto.createHmac("sha256", getSecret()).update(json).digest();
  return `${base64url(json)}.${base64url(sig)}`;
}

export function verifyPkceState(token: string): (PkceState & { exp: number }) | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [bodyB64, sigB64] = parts;
  let json: string;
  try {
    json = base64urlDecode(bodyB64).toString("utf8");
  } catch {
    return null;
  }
  const expected = crypto.createHmac("sha256", getSecret()).update(json).digest();
  const got = base64urlDecode(sigB64);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(json) as PkceState & { exp: number };
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
