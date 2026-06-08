import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  entraTokenUrl,
  getEntraConfig,
  isEntraConfigured,
} from "@/lib/entra-config";
import {
  ENTRA_PKCE_COOKIE,
  setEntraSessionCookie,
  verifyPkceState,
} from "@/lib/entra-session";
import { provisionEntraStaff } from "@/lib/entra-user-provision";

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type IdTokenClaims = {
  oid?: string;
  sub?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  groups?: string[];
};

function decodeJwtPayload(token: string): IdTokenClaims | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
      "utf8",
    );
    return JSON.parse(json) as IdTokenClaims;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  if (!isEntraConfigured()) {
    return NextResponse.redirect(new URL("/sign-in?error=entra_not_configured", req.url));
  }

  const cfg = getEntraConfig()!;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  if (err) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(err)}`, req.url),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", req.url));
  }

  const jar = await cookies();
  const pkceRaw = jar.get(ENTRA_PKCE_COOKIE)?.value;
  jar.delete(ENTRA_PKCE_COOKIE);
  const pkce = pkceRaw ? verifyPkceState(pkceRaw) : null;
  if (!pkce || pkce.state !== state) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_state", req.url));
  }

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    code_verifier: pkce.verifier,
  });
  if (cfg.clientSecret) {
    body.set("client_secret", cfg.clientSecret);
  }

  const tokenRes = await fetch(entraTokenUrl(cfg.tenantId), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokens = (await tokenRes.json()) as TokenResponse;
  if (!tokenRes.ok || !tokens.id_token) {
    const msg = tokens.error_description ?? tokens.error ?? "token_exchange_failed";
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(msg)}`, req.url),
    );
  }

  const claims = decodeJwtPayload(tokens.id_token);
  const oid = claims?.oid ?? claims?.sub;
  const email = claims?.email ?? claims?.preferred_username;
  if (!oid || !email) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_claims", req.url));
  }

  const staff = await provisionEntraStaff(
    { oid, email, name: claims?.name ?? null },
    claims?.groups ?? [],
  );

  await setEntraSessionCookie({
    entraOid: oid,
    email,
    name: claims?.name ?? null,
    userId: staff.userId,
    orgId: staff.orgId,
    orgSlug: staff.orgSlug,
    role: staff.role,
  });

  const returnTo = pkce.returnTo.startsWith("/") ? pkce.returnTo : `/${cfg.defaultOrgSlug}`;
  return NextResponse.redirect(new URL(returnTo, req.url));
}
