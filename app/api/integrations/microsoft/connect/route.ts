import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireStaffSession } from "@/lib/auth";
import { microsoft365Adapter } from "@/lib/adapters/microsoft365";
import { signPkceState } from "@/lib/entra-session";

const GRAPH_OAUTH_COOKIE = "pp_graph_oauth";

export async function GET(req: Request) {
  const staff = await requireStaffSession();
  if (!microsoft365Adapter.isConfigured()) {
    return NextResponse.json({ error: "Graph not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo") ?? `/${staff.orgSlug}/enterprise/integrations`;

  const state = crypto.randomUUID();
  const verifier = crypto.randomUUID();
  const token = signPkceState({ verifier, state, returnTo });

  const jar = await cookies();
  jar.set(GRAPH_OAUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(microsoft365Adapter.getAuthorizeUrl(state));
}
