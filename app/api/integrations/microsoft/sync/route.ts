import { NextResponse } from "next/server";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { syncMicrosoft365ForOrg } from "@/lib/integrations/microsoft365-sync";

export async function POST(req: Request) {
  const body = (await req.json()) as { orgSlug?: string };
  if (!body.orgSlug) {
    return NextResponse.json({ error: "orgSlug required" }, { status: 400 });
  }

  const staff = await requireOrgAccessForSlug(body.orgSlug);

  try {
    const result = await syncMicrosoft365ForOrg(staff.orgId);
    return NextResponse.json({
      ok: true,
      threads: result.mailThreads,
      calendarEvents: result.calendarEvents,
      contacts: result.contacts,
      syncedAt: result.syncedAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync_failed";
    const status = msg === "M365_NOT_CONNECTED" ? 400 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
