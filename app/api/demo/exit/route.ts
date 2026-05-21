/**
 * POST /api/demo/exit — clear the demo cookie and bounce back to /demo.
 */

import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import {
  DEMO_COOKIE_NAME,
  DEMO_ORG_ID,
  DEMO_USER_ID,
  isDemoModeEnabled,
} from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  if (isDemoModeEnabled()) {
    await writeAuditLog({
      orgId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
      action: "demo.exited",
      entity: "DemoSession",
      diff: { source: "/api/demo/exit" },
    });
  }

  const res = NextResponse.redirect(new URL("/demo", getOrigin()), {
    status: 303,
  });
  res.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });
  return res;
}

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
