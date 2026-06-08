/**
 * Public advocacy take-action submit — no auth; rate-limited.
 */

import { NextResponse } from "next/server";
import { submitTakeActionResponse } from "@/lib/advocacy/submit-take-action-response";
import { loadPublicAdvocacyCampaign } from "@/lib/advocacy/load-public-campaign";
import { enforceRateLimit, rejectOversizeJson } from "@/lib/security/api-guard";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orgSlug: string; campaignId: string }> },
) {
  const { orgSlug, campaignId } = await ctx.params;

  if (!rejectOversizeJson(req)) {
    return NextResponse.json({ ok: false, message: "Payload too large" }, { status: 413 });
  }

  const rl = enforceRateLimit(req, {
    routeKey: `public-advocacy:${orgSlug}:${campaignId}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return NextResponse.json({ ok: false, message: "Unknown organization" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = await submitTakeActionResponse(org.id, campaignId, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    responseCount: result.responseCount,
    duplicate: result.duplicate,
  });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orgSlug: string; campaignId: string }> },
) {
  const { orgSlug, campaignId } = await ctx.params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return NextResponse.json({ ok: false, message: "Unknown organization" }, { status: 404 });
  }

  const campaign = await loadPublicAdvocacyCampaign(org.id, campaignId);
  if (!campaign) {
    return NextResponse.json({ ok: false, message: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, campaign });
}
