/**
 * Platform cron endpoint — call via Vercel Cron or external scheduler.
 * Secured with CRON_SECRET header.
 */

import { NextResponse } from "next/server";
import { runPlatformCron } from "@/lib/jobs/platform-cron";
import { isCronAuthorized } from "@/lib/security/production-guards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runPlatformCron();
  return NextResponse.json({ ok: true, results, at: new Date().toISOString() });
}

export async function POST(req: Request) {
  return GET(req);
}
