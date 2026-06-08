import { NextResponse } from "next/server";
import { clearEntraSessionCookie } from "@/lib/entra-session";
import { getEntraConfig } from "@/lib/entra-config";

export async function POST(req: Request) {
  await clearEntraSessionCookie();
  const cfg = getEntraConfig();
  if (cfg) {
    const logout = `https://login.microsoftonline.com/${encodeURIComponent(cfg.tenantId)}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")}`;
    return NextResponse.json({ ok: true, logoutUrl: logout });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  await clearEntraSessionCookie();
  return NextResponse.redirect(new URL("/", req.url));
}
