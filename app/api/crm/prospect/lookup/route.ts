import { NextResponse } from "next/server";
import { getOrgDb } from "@/lib/db";
import { verifyProspectorHeaders } from "@/lib/crm/prospector-auth";
import { enrichProspect, parseEnrichmentData } from "@/lib/crm/prospector-enrichment";

export async function GET(req: Request) {
  const auth = await verifyProspectorHeaders(req);
  if ("error" in auth) {
    return NextResponse.json({ ok: false, message: auth.error }, { status: auth.status });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? undefined;
  const domain = url.searchParams.get("domain")?.trim() ?? undefined;
  const company = url.searchParams.get("company")?.trim() ?? undefined;

  if (!email && !domain && !company) {
    return NextResponse.json({ ok: false, message: "Provide email, domain, or company" }, { status: 400 });
  }

  const db = getOrgDb(auth.orgId);
  const member = email
    ? await db.member.findFirst({
        where: { email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          jobTitle: true,
          linkedInUrl: true,
          websiteUrl: true,
          enrichmentData: true,
        },
      })
    : null;

  const firmographics =
    member && parseEnrichmentData(member.enrichmentData)
      ? parseEnrichmentData(member.enrichmentData)!
      : enrichProspect({
          email,
          company: company ?? member?.company,
          websiteUrl: domain ? `https://${domain}` : member?.websiteUrl,
        });

  return NextResponse.json({
    ok: true,
    member: member
      ? {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          company: member.company,
          profileUrl: `/${auth.orgSlug}/members/${member.id}`,
        }
      : null,
    firmographics,
  });
}
