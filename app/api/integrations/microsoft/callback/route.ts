import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireStaffSession } from "@/lib/auth";
import { connectMicrosoft365FromCode } from "@/lib/integrations/microsoft365-sync";
import { isMicrosoft365Configured } from "@/lib/adapters/microsoft365";
import { upsertMicrosoft365Connection } from "@/lib/adapters/microsoft365";
import { verifyPkceState } from "@/lib/entra-session";

const GRAPH_OAUTH_COOKIE = "pp_graph_oauth";

export async function GET(req: Request) {
  const staff = await requireStaffSession();
  if (!isMicrosoft365Configured()) {
    return NextResponse.redirect(new URL("/sign-in?error=graph_not_configured", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/${staff.orgSlug}/enterprise/integrations?error=missing_code`, req.url),
    );
  }

  const jar = await cookies();
  const raw = jar.get(GRAPH_OAUTH_COOKIE)?.value;
  jar.delete(GRAPH_OAUTH_COOKIE);
  const oauth = raw ? verifyPkceState(raw) : null;
  if (!oauth || oauth.state !== state) {
    return NextResponse.redirect(
      new URL(`/${staff.orgSlug}/enterprise/integrations?error=invalid_state`, req.url),
    );
  }

  try {
    await connectMicrosoft365FromCode(staff.orgId, code);
  } catch {
    await upsertMicrosoft365Connection(staff.orgId, { status: "ERROR" });
    return NextResponse.redirect(
      new URL(`/${staff.orgSlug}/enterprise/integrations?error=token_exchange`, req.url),
    );
  }

  const returnTo = oauth.returnTo.startsWith("/")
    ? oauth.returnTo
    : `/${staff.orgSlug}/enterprise/integrations`;
  return NextResponse.redirect(new URL(`${returnTo}?connected=microsoft`, req.url));
}
