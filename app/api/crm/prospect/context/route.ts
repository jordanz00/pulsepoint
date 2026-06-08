import { NextResponse } from "next/server";
import { getOrgDb } from "@/lib/db";
import { verifyProspectorHeaders } from "@/lib/crm/prospector-auth";
import { enrichProspect, parseEnrichmentData } from "@/lib/crm/prospector-enrichment";

export async function GET(req: Request) {
  const auth = await verifyProspectorHeaders(req);
  if ("error" in auth) {
    return NextResponse.json({ ok: false, message: auth.error }, { status: auth.status });
  }

  const memberId = new URL(req.url).searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ ok: false, message: "memberId required" }, { status: 400 });
  }

  const db = getOrgDb(auth.orgId);
  const member = await db.member.findFirst({
    where: { id: memberId },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 8, include: { author: { select: { name: true } } } },
      contactSources: { orderBy: { capturedAt: "desc" }, take: 5 },
      crmWorkflowRuns: {
        where: { status: "ACTIVE" },
        take: 5,
        include: { workflow: { select: { name: true } } },
      },
    },
  });

  if (!member) {
    return NextResponse.json({ ok: false, message: "Member not found" }, { status: 404 });
  }

  const firmographics =
    parseEnrichmentData(member.enrichmentData) ??
    enrichProspect({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      company: member.company,
      jobTitle: member.jobTitle,
      linkedInUrl: member.linkedInUrl,
      websiteUrl: member.websiteUrl,
    });

  return NextResponse.json({
    ok: true,
    member: {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      company: member.company,
      jobTitle: member.jobTitle,
      relationshipHealth: member.relationshipHealth,
      lastTouchAt: member.lastTouchAt,
      nextFollowUpAt: member.nextFollowUpAt,
      profileUrl: `/${auth.orgSlug}/members/${member.id}`,
    },
    firmographics,
    notes: member.notes.map((n) => ({
      id: n.id,
      body: n.body,
      channel: n.channel,
      createdAt: n.createdAt,
      author: n.author?.name ?? "Staff",
    })),
    sources: member.contactSources.map((s) => ({ kind: s.sourceKind, label: s.label })),
    workflows: member.crmWorkflowRuns.map((r) => r.workflow.name),
  });
}
