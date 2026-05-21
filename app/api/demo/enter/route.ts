/**
 * POST /api/demo/enter — issue a signed demo-mode cookie and redirect to
 * the seeded demo org. Hard-fails outside demo mode.
 *
 * Triple gate (enforced in lib/demo-mode.ts):
 *   1. NODE_ENV !== "production"
 *   2. DEMO_MODE === "true"
 *   3. DEMO_SESSION_SECRET present and >= 32 chars
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import {
  DEMO_COOKIE_MAX_AGE_SECONDS,
  DEMO_COOKIE_NAME,
  DEMO_ORG_ID,
  DEMO_ORG_SLUG,
  DEMO_USER_ID,
  isDemoModeEnabled,
  signDemoCookie,
} from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  if (!isDemoModeEnabled()) {
    return NextResponse.json(
      { ok: false, code: "DEMO_MODE_DISABLED" },
      { status: 404 },
    );
  }

  const org = await prisma.organization.findUnique({
    where: { id: DEMO_ORG_ID },
  });
  if (!org) {
    return NextResponse.json(
      {
        ok: false,
        code: "DEMO_NOT_SEEDED",
        message:
          "Demo org not found. Run `pnpm db:seed:demo` to create the demo data, then retry.",
      },
      { status: 412 },
    );
  }

  await writeAuditLog({
    orgId: DEMO_ORG_ID,
    userId: DEMO_USER_ID,
    action: "demo.entered",
    entity: "DemoSession",
    diff: { source: "/api/demo/enter" },
  });

  const cookieValue = signDemoCookie();
  const res = NextResponse.redirect(new URL(`/${DEMO_ORG_SLUG}`, getOrigin()), {
    status: 303,
  });
  res.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: false, // non-prod only — see lib/demo-mode.ts gate
    path: "/",
    maxAge: DEMO_COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
