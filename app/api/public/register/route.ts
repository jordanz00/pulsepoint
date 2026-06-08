/**
 * Public event registration (rate-limited)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgDb, prisma } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkRegistrationGuards } from "@/lib/register-guards";
import { publicRegistrationSchema } from "@/lib/validations/event";
import { checkRegistrationWindow } from "@/lib/event-registration-window";
import { generateBadgeCode } from "@/lib/event-badge";
import { writeAuditLog } from "@/lib/audit";
import { DEFAULT_FROM } from "@/lib/email";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import { runSoftFailStep } from "@/lib/automation";
import { resolveEventRegistrationPrice } from "@/lib/events/resolve-registration-price";

const registerBodySchema = publicRegistrationSchema.extend({
  orgSlug: z.string().min(1).max(80),
  eventSlug: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

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

  const { orgSlug, eventSlug, guestName, guestEmail, ticketTypeId, promoCode } =
    parsed.data;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const guarded = checkRegistrationGuards({
    ip,
    orgId: org.id,
    guestEmail: parsed.data.guestEmail,
  });
  if (!guarded.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(guarded.retryAfterSec) },
      },
    );
  }

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { publicSlug: eventSlug, status: "PUBLISHED" },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not available" }, { status: 404 });
  }

  const window = checkRegistrationWindow(event);
  if (!window.open) {
    const messages: Record<string, string> = {
      not_published: "Registration is not open",
      not_open_yet: "Registration has not opened yet",
      closed: "Registration is closed",
      cancelled: "This event was cancelled",
      completed: "This event has ended",
    };
    return NextResponse.json(
      { error: messages[window.reason] ?? "Registration unavailable" },
      { status: 403 },
    );
  }

  const { priceCents, promoCodeUsed } = await resolveEventRegistrationPrice(db, {
    eventId: event.id,
    eventPriceCents: event.priceCents,
    ticketTypeId,
    promoCode,
    consumePromo: true,
  });

  if (event.capacity) {
    const confirmed = await db.eventRegistration.count({
      where: {
        eventId: event.id,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });
    if (confirmed >= event.capacity) {
      if (!event.waitlistEnabled) {
        return NextResponse.json({ error: "Event is at capacity" }, { status: 409 });
      }
      const maxPos = await db.eventRegistration.aggregate({
        where: { eventId: event.id, status: "WAITLIST" },
        _max: { waitlistPosition: true },
      });
      const waitlist = await db.eventRegistration.create({
        data: {
          orgId: org.id,
          eventId: event.id,
          guestName,
          guestEmail,
          ticketTypeId: ticketTypeId ?? null,
          status: "WAITLIST",
          waitlistPosition: (maxPos._max.waitlistPosition ?? 0) + 1,
          promoCodeUsed,
        },
      });
      return NextResponse.json({
        ok: true,
        waitlisted: true,
        registrationId: waitlist.id,
      });
    }
  }

  const status = priceCents > 0 ? "PENDING" : "CONFIRMED";

  const registration = await db.eventRegistration.create({
    data: {
      orgId: org.id,
      eventId: event.id,
      guestName,
      guestEmail,
      ticketTypeId: ticketTypeId ?? null,
      status,
      paidAt: status === "CONFIRMED" ? new Date() : null,
      promoCodeUsed,
    },
  });
  if (status === "CONFIRMED") {
    await db.eventRegistration.update({
      where: { id: registration.id },
      data: { badgeCode: generateBadgeCode(registration.id) },
    });
  }

  const memberMatch = guestEmail
    ? await db.member.findFirst({ where: { orgId: org.id, email: guestEmail } })
    : null;
  if (memberMatch) {
    const { autoRecomputeEngagement } = await import("@/lib/jobs/auto-engagement");
    await autoRecomputeEngagement(org.id, memberMatch.id).catch(() => undefined);
  }

  await writeAuditLog({
    orgId: org.id,
    userId: null,
    action: "registration.created",
    entity: "EventRegistration",
    entityId: registration.id,
    diff: { eventId: event.id, ip },
  });

  const emailSendLimit = checkRateLimit(
    `register:send:${guestEmail.trim().toLowerCase()}`,
    3,
    3_600_000,
  );

  if (emailSendLimit.ok) {
    await runSoftFailStep({
      orgId: org.id,
      workflow: "registration.confirm_email",
      step: "email.adapter.send",
      run: async () => {
        await sendEmailWithFailover({
          from: DEFAULT_FROM,
          to: guestEmail,
          subject: `Registration: ${event.title}`,
          text: `Hi ${guestName},\n\nYou are registered for ${event.title} on ${event.startsAt.toLocaleString()}.\n\n— PulsePoint`,
        });
      },
    });
  }

  return NextResponse.json({
    ok: true,
    registrationId: registration.id,
    requiresPayment: priceCents > 0,
    checkoutAvailable: priceCents > 0,
  });
}
