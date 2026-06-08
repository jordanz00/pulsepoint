import { NextResponse } from "next/server";
import { verifyProspectorHeaders } from "@/lib/crm/prospector-auth";
import { enrichProspect } from "@/lib/crm/prospector-enrichment";
import { suggestEnrichment } from "@/lib/crm/enrichment";
import { prospectEnrichSchema } from "@/lib/validations/prospector";

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

  const parsed = prospectEnrichSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const firmographics = enrichProspect(parsed.data);
  const suggestions = suggestEnrichment({
    firstName: parsed.data.firstName ?? "",
    lastName: parsed.data.lastName ?? "",
    email: parsed.data.email || null,
    company: parsed.data.company || firmographics.companyName,
    jobTitle: parsed.data.jobTitle || null,
    linkedInUrl: parsed.data.linkedInUrl || firmographics.socialProfiles.linkedin || null,
  });

  return NextResponse.json({ ok: true, firmographics, suggestions });
}
