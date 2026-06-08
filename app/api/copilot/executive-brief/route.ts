import { NextResponse } from "next/server";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { buildExecutiveBrief } from "@/lib/copilot/executive-brief";
import { enforceRateLimit } from "@/lib/security/api-guard";
import { sanitizeCopilotBriefOutput } from "@/lib/security/llm-boundary";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orgSlug = url.searchParams.get("orgSlug");
  if (!orgSlug || orgSlug.length > 80 || !/^[a-z0-9-]+$/.test(orgSlug)) {
    return NextResponse.json({ error: "orgSlug required" }, { status: 400 });
  }

  const staff = await requireOrgAccessForSlug(orgSlug);
  const rl = enforceRateLimit(req, {
    routeKey: `copilot-brief:${staff.userId}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return NextResponse.json({ error: "org_not_found" }, { status: 404 });
  }

  const dashboard = await loadExecutiveDashboard(org.id);
  const brief = sanitizeCopilotBriefOutput(buildExecutiveBrief(dashboard));

  return NextResponse.json({
    ok: true,
    source: "loadExecutiveDashboard",
    mode: "executive_brief_template",
    orgSlug,
    brief,
  });
}
