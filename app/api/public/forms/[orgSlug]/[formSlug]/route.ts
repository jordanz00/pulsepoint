/**
 * Public web form submit — no auth; rate-limit at edge in production.
 */

import { NextResponse } from "next/server";
import { submitPublicWebForm } from "@/app/actions/web-forms";
import { enforceRateLimit, rejectOversizeJson } from "@/lib/security/api-guard";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orgSlug: string; formSlug: string }> },
) {
  const { orgSlug, formSlug } = await ctx.params;

  if (!rejectOversizeJson(req)) {
    return NextResponse.json({ ok: false, message: "Payload too large" }, { status: 413 });
  }

  const rl = enforceRateLimit(req, {
    routeKey: `public-form:${orgSlug}:${formSlug}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = await submitPublicWebForm(orgSlug, formSlug, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, memberId: result.memberId });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orgSlug: string; formSlug: string }> },
) {
  const { orgSlug, formSlug } = await ctx.params;
  const { prisma } = await import("@/lib/prisma");
  const { parseWebFormFields } = await import("@/lib/crm/web-form-fields");

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return NextResponse.json({ ok: false, message: "Unknown organization" }, { status: 404 });
  }

  const form = await prisma.webForm.findFirst({
    where: { orgId: org.id, slug: formSlug, published: true },
  });
  if (!form) {
    return NextResponse.json({ ok: false, message: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    name: form.name,
    description: form.description,
    fields: parseWebFormFields(form.fields),
  });
}
