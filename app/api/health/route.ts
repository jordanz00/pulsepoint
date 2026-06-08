/**
 * Fast liveness probe — no DB, no auth. Use to detect hung dev servers.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "pulsepoint-web",
      ts: new Date().toISOString(),
    },
    { status: 200 },
  );
}
