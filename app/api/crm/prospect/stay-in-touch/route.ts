import { NextResponse } from "next/server";
import { verifyProspectorHeaders } from "@/lib/crm/prospector-auth";
import { prospectorStayInTouchWithToken } from "@/app/actions/prospector";

export async function POST(req: Request) {
  const auth = await verifyProspectorHeaders(req);
  if ("error" in auth) {
    return NextResponse.json({ ok: false, message: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = await prospectorStayInTouchWithToken(auth.orgId, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
