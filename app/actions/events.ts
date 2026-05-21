"use server";

/**
 * Events server actions — PulseCore Phase 2
 */

import { revalidatePath } from "next/cache";
import { requireStaffSession } from "@/lib/auth";
import { getOrgDb, prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { eventInputSchema } from "@/lib/validations/event";
import type { ActionResult } from "@/app/actions/members";

export async function listEvents(): Promise<
  ActionResult<{ events: Awaited<ReturnType<typeof fetchEvents>> }>
> {
  try {
    const staff = await requireStaffSession();
    const events = await fetchEvents(staff.orgId);
    return { ok: true, data: { events } };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

async function fetchEvents(orgId: string) {
  const db = getOrgDb(orgId);
  return db.event.findMany({
    orderBy: { startsAt: "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });
}

export async function getEvent(
  eventId: string,
): Promise<ActionResult<{ event: NonNullable<Awaited<ReturnType<typeof fetchOneEvent>>> }>> {
  try {
    const staff = await requireStaffSession();
    const event = await fetchOneEvent(staff.orgId, eventId);
    if (!event) return { ok: false, error: "Event not found" };
    return { ok: true, data: { event } };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

async function fetchOneEvent(orgId: string, eventId: string) {
  const db = getOrgDb(orgId);
  return db.event.findFirst({
    where: { id: eventId },
    include: {
      registrations: {
        orderBy: { createdAt: "desc" },
        include: { member: true },
      },
    },
  });
}

export async function createEvent(
  raw: unknown,
): Promise<ActionResult<{ eventId: string }>> {
  try {
    const staff = await requireStaffSession();
    const parsed = eventInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid event data" };
    }
    const db = getOrgDb(staff.orgId);
    const input = parsed.data;

    const slugTaken = await db.event.findFirst({
      where: { publicSlug: input.publicSlug },
    });
    if (slugTaken) {
      return { ok: false, error: "Public URL slug is already in use" };
    }

    const event = await db.event.create({
      data: {
        orgId: staff.orgId,
        title: input.title,
        description: input.description ?? "",
        startsAt: input.startsAt,
        endsAt: input.endsAt ?? null,
        capacity: input.capacity ?? null,
        priceCents: input.priceCents ?? 0,
        status: input.status ?? "DRAFT",
        publicSlug: input.publicSlug,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "event.created",
      entity: "Event",
      entityId: event.id,
    });

    revalidatePath(`/${staff.orgSlug}/events`);
    return { ok: true, data: { eventId: event.id } };
  } catch {
    return { ok: false, error: "Could not create event" };
  }
}

export async function updateEvent(
  eventId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireStaffSession();
    const parsed = eventInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid event data" };
    }
    const db = getOrgDb(staff.orgId);
    const input = parsed.data;

    const existing = await db.event.findFirst({ where: { id: eventId } });
    if (!existing) return { ok: false, error: "Event not found" };

    if (input.publicSlug !== existing.publicSlug) {
      const slugTaken = await db.event.findFirst({
        where: { publicSlug: input.publicSlug },
      });
      if (slugTaken) {
        return { ok: false, error: "Public URL slug is already in use" };
      }
    }

    await db.event.update({
      where: { id: eventId },
      data: {
        title: input.title,
        description: input.description ?? "",
        startsAt: input.startsAt,
        endsAt: input.endsAt ?? null,
        capacity: input.capacity ?? null,
        priceCents: input.priceCents ?? 0,
        status: input.status ?? existing.status,
        publicSlug: input.publicSlug,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "event.updated",
      entity: "Event",
      entityId: eventId,
    });

    revalidatePath(`/${staff.orgSlug}/events`);
    revalidatePath(`/${staff.orgSlug}/events/${eventId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update event" };
  }
}

export async function toggleCheckIn(
  registrationId: string,
): Promise<ActionResult> {
  try {
    const staff = await requireStaffSession();
    const db = getOrgDb(staff.orgId);
    const reg = await db.eventRegistration.findFirst({
      where: { id: registrationId },
    });
    if (!reg) return { ok: false, error: "Registration not found" };

    await db.eventRegistration.update({
      where: { id: registrationId },
      data: {
        checkedInAt: reg.checkedInAt ? null : new Date(),
      },
    });

    revalidatePath(`/${staff.orgSlug}/events/${reg.eventId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Check-in failed" };
  }
}

export async function createCheckoutSession(
  orgSlug: string,
  eventSlug: string,
  registrationId: string,
): Promise<ActionResult<{ url: string }>> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Payments are not configured" };
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { publicSlug: eventSlug, status: "PUBLISHED" },
  });
  if (!event || event.priceCents <= 0) {
    return { ok: false, error: "Event is not available for paid registration" };
  }

  const reg = await db.eventRegistration.findFirst({
    where: { id: registrationId, eventId: event.id },
  });
  if (!reg) return { ok: false, error: "Registration not found" };

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/${orgSlug}/e/${eventSlug}?registered=1`,
    cancel_url: `${baseUrl}/${orgSlug}/e/${eventSlug}?cancelled=1`,
    metadata: {
      registrationId: reg.id,
      orgId: org.id,
      eventId: event.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: event.priceCents,
          product_data: { name: event.title },
        },
      },
    ],
  });

  if (!session.url) {
    return { ok: false, error: "Could not start checkout" };
  }

  return { ok: true, data: { url: session.url } };
}
