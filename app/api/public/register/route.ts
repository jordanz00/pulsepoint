/**
 * Public event registration (rate-limited)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgDb, prisma } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { publicRegistrationSchema } from "@/lib/validations/event";
import { writeAuditLog } from "@/lib/audit";
import { isResendConfigured, getResend, DEFAULT_FROM } from "@/lib/email";

const registerBodySchema = publicRegistrationSchema.extend({
  orgSlug: z.string().min(1).max(80),
  eventSlug: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = checkRateLimit(`register:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration" }, { status: 400 });
  }

  const { orgSlug, eventSlug, guestName, guestEmail } = parsed.data;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { publicSlug: eventSlug, status: "PUBLISHED" },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not available" }, { status: 404 });
  }

  if (event.capacity) {
    const confirmed = await db.eventRegistration.count({
      where: {
        eventId: event.id,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });
    if (confirmed >= event.capacity) {
      const waitlist = await db.eventRegistration.create({
        data: {
          orgId: org.id,
          eventId: event.id,
          guestName,
          guestEmail,
          status: "WAITLIST",
        },
      });
      return NextResponse.json({
        ok: true,
        waitlisted: true,
        registrationId: waitlist.id,
      });
    }
  }

  const status = event.priceCents > 0 ? "PENDING" : "CONFIRMED";

  const registration = await db.eventRegistration.create({
    data: {
      orgId: org.id,
      eventId: event.id,
      guestName,
      guestEmail,
      status,
      paidAt: status === "CONFIRMED" ? new Date() : null,
    },
  });

  await writeAuditLog({
    orgId: org.id,
    userId: null,
    action: "registration.created",
    entity: "EventRegistration",
    entityId: registration.id,
    diff: { eventId: event.id, ip },
  });

  if (isResendConfigured()) {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: DEFAULT_FROM,
        to: guestEmail,
        subject: `Registration: ${event.title}`,
        text: `Hi ${guestName},\n\nYou are registered for ${event.title} on ${event.startsAt.toLocaleString()}.\n\n— PulseCore`,
      });
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({
    ok: true,
    registrationId: registration.id,
    requiresPayment: event.priceCents > 0,
    checkoutAvailable:
      event.priceCents > 0 && Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
