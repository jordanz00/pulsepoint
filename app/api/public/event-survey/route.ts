import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgDb, prisma } from "@/lib/db";

const bodySchema = z.object({
  orgSlug: z.string().min(1),
  eventId: z.string().cuid(),
  guestEmail: z.string().email().max(254).optional(),
  registrationId: z.string().cuid().optional(),
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid survey submission" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { slug: parsed.data.orgSlug },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getOrgDb(org.id);
  const survey = await db.eventSurvey.findFirst({
    where: { eventId: parsed.data.eventId, active: true },
  });
  if (!survey) {
    return NextResponse.json({ error: "Survey not available" }, { status: 404 });
  }

  const now = new Date();
  if (survey.opensAt && now < survey.opensAt) {
    return NextResponse.json({ error: "Survey not open yet" }, { status: 403 });
  }
  if (survey.closesAt && now > survey.closesAt) {
    return NextResponse.json({ error: "Survey closed" }, { status: 403 });
  }

  await db.eventSurveyResponse.create({
    data: {
      orgId: org.id,
      surveyId: survey.id,
      registrationId: parsed.data.registrationId ?? null,
      guestEmail: parsed.data.guestEmail ?? null,
      answers: parsed.data.answers,
    },
  });

  return NextResponse.json({ ok: true });
}
