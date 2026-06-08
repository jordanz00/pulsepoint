/**
 * Web capture API — add/update contacts from inbox, LinkedIn, or bookmarklet.
 * Auth: X-PulsePoint-Capture-Token + X-PulsePoint-Org-Id (demo/local).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureContactFromWeb } from "@/app/actions/crm";

export async function POST(req: Request) {
  const orgId = req.headers.get("x-pulsepoint-org-id");
  const token = req.headers.get("x-pulsepoint-capture-token");

  if (!orgId || !token) {
    return NextResponse.json(
      { ok: false, message: "Missing org id or capture token" },
      { status: 401 },
    );
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return NextResponse.json({ ok: false, message: "Unknown organization" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = await captureContactFromWeb(orgId, token, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    memberId: result.data?.memberId,
    profileUrl: `/${org.slug}/members/${result.data?.memberId}`,
  });
}
