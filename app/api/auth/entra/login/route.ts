import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ENTRA_SCOPES,
  entraAuthorizeUrl,
  getEntraConfig,
  isEntraConfigured,
} from "@/lib/entra-config";
import {
  ENTRA_PKCE_COOKIE,
  generatePkce,
  signPkceState,
} from "@/lib/entra-session";

export async function GET(req: Request) {
  if (!isEntraConfigured()) {
    return NextResponse.json({ error: "Entra not configured" }, { status: 503 });
  }
  const cfg = getEntraConfig()!;
  const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo") ?? `/${cfg.defaultOrgSlug}`;

  const { verifier, challenge } = generatePkce();
  const state = crypto.randomUUID();
  const pkceToken = signPkceState({ verifier, state, returnTo });

  const jar = await cookies();
  jar.set(ENTRA_PKCE_COOKIE, pkceToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: "code",
    redirect_uri: cfg.redirectUri,
    response_mode: "query",
    scope: ENTRA_SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(`${entraAuthorizeUrl(cfg.tenantId)}?${params}`);
}