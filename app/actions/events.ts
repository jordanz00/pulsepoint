"use server";

/**
 * Events server actions — PulsePoint Phase 2
 */

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb, prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { assertEventTransition } from "@/lib/event-state";
import { getEventPublishReadiness } from "@/lib/events/publish-readiness";
import {
  buildEventRegistrationUrl,
  eventRegistrationPath,
} from "@/lib/events/registration-url";
import { getActivePaymentAdapter } from "@/lib/adapters/payments";
import { shouldSimulateDemoPayment } from "@/lib/demo-payment";
import { generateBadgeCode } from "@/lib/event-badge";
import { resolveEventRegistrationPrice } from "@/lib/events/resolve-registration-price";
import { eventInputSchema } from "@/lib/validations/event";
import type { ActionResult } from "@/app/actions/members";
import {
  PAGE_SIZE,
  buildCursorQuery,
  paginateSlice,
  type PaginatedResult,
} from "@/lib/pagination";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";

export async function listEvents(): Promise<
  ActionResult<{ events: Awaited<ReturnType<typeof fetchEvents>> }>
> {
  try {
    const staff = await requireCapability("event:read");
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

export async function getEvents(
  raw: { cursor?: string; take?: number; search?: string },
  orgSlug?: string,
): Promise<
  ActionResult<
    PaginatedResult<
      Awaited<ReturnType<typeof fetchEvents>>[number]
    >
  >
> {
  try {
    const staff = await requireCapability("event:read", { orgSlug });
    const take = Math.min(Math.max(raw.take ?? PAGE_SIZE, 1), 100);
    const db = getOrgDb(staff.orgId);
    const q = raw.search?.trim();
    const where = q ? { title: { contains: q } } : {};

    const [totalCount, rows] = await Promise.all([
      db.event.count({ where }),
      db.event.findMany({
        where,
        orderBy: [{ startsAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...buildCursorQuery(raw.cursor),
        include: { _count: { select: { registrations: true } } },
      }),
    ]);

    assertAllRowsBelongToOrg(rows, staff.orgId, "getEvents");
    const { items, nextCursor } = paginateSlice(rows, take);
    return { ok: true, data: { items, nextCursor, totalCount } };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

export async function getEvent(
  eventId: string,
): Promise<ActionResult<{ event: NonNullable<Awaited<ReturnType<typeof fetchOneEvent>>> }>> {
  try {
    const staff = await requireCapability("event:read");
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
  orgSlug?: string,
): Promise<ActionResult<{ eventId: string }>> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
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

    const nextStatus = input.status ?? "DRAFT";
    if (nextStatus === "PUBLISHED") {
      const readiness = getEventPublishReadiness({
        title: input.title,
        startsAt: input.startsAt,
        publicSlug: input.publicSlug,
      });
      if (!readiness.ready) {
        return { ok: false, error: readiness.blockers[0] ?? "Event is not ready to publish" };
      }
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
        status: nextStatus,
        publicSlug: input.publicSlug,
        venueName: input.venueName ?? "",
        venueAddress: input.venueAddress ?? "",
        timezone: input.timezone ?? "America/New_York",
        format: input.format ?? "IN_PERSON",
        registrationOpensAt: input.registrationOpensAt ?? null,
        registrationClosesAt: input.registrationClosesAt ?? null,
        waitlistEnabled: input.waitlistEnabled ?? true,
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
    revalidatePath(`/${staff.orgSlug}/events/${event.id}`);
    return { ok: true, data: { eventId: event.id } };
  } catch {
    return { ok: false, error: "Could not create event" };
  }
}

/** Publish a draft event — validates readiness and records audit. */
export async function publishEvent(
  eventId: string,
  orgSlug?: string,
): Promise<ActionResult<{ registrationUrl: string; registrationPath: string }>> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const existing = await db.event.findFirst({ where: { id: eventId } });
    if (!existing) return { ok: false, error: "Event not found" };

    const slug = staff.orgSlug;
    const registrationPath = eventRegistrationPath(slug, existing.publicSlug);
    const registrationUrl = buildEventRegistrationUrl(slug, existing.publicSlug);

    if (existing.status === "PUBLISHED") {
      return { ok: true, data: { registrationUrl, registrationPath } };
    }
    if (existing.status !== "DRAFT") {
      return { ok: false, error: "Only draft events can be published from this action." };
    }

    const readiness = getEventPublishReadiness({
      title: existing.title,
      startsAt: existing.startsAt,
      publicSlug: existing.publicSlug,
    });
    if (!readiness.ready) {
      return { ok: false, error: readiness.blockers[0] ?? "Event is not ready to publish" };
    }

    assertEventTransition(existing.status, "PUBLISHED");

    await db.event.update({
      where: { id: eventId },
      data: { status: "PUBLISHED" },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "event.published",
      entity: "Event",
      entityId: eventId,
    });

    revalidatePath(`/${slug}/events`);
    revalidatePath(`/${slug}/events/${eventId}`);
    return { ok: true, data: { registrationUrl, registrationPath } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("INVALID_EVENT_TRANSITION")) {
      return { ok: false, error: "This event cannot be published from its current status." };
    }
    return { ok: false, error: "Could not publish event" };
  }
}

export async function updateEvent(
  eventId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
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

    const nextStatus = input.status ?? existing.status;
    if (nextStatus !== existing.status) {
      assertEventTransition(existing.status, nextStatus);
      if (nextStatus === "PUBLISHED") {
        const readiness = getEventPublishReadiness({
          title: input.title,
          startsAt: input.startsAt,
          publicSlug: input.publicSlug,
        });
        if (!readiness.ready) {
          return { ok: false, error: readiness.blockers[0] ?? "Event is not ready to publish" };
        }
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
        status: nextStatus,
        publicSlug: input.publicSlug,
        venueName: input.venueName ?? existing.venueName,
        venueAddress: input.venueAddress ?? existing.venueAddress,
        timezone: input.timezone ?? existing.timezone,
        format: input.format ?? existing.format,
        registrationOpensAt:
          input.registrationOpensAt !== undefined
            ? input.registrationOpensAt
            : existing.registrationOpensAt,
        registrationClosesAt:
          input.registrationClosesAt !== undefined
            ? input.registrationClosesAt
            : existing.registrationClosesAt,
        waitlistEnabled: input.waitlistEnabled ?? existing.waitlistEnabled,
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
  orgSlug?: string,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:checkin", { orgSlug });
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
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { publicSlug: eventSlug, status: "PUBLISHED" },
  });
  if (!event) {
    return { ok: false, error: "Event is not available for paid registration" };
  }

  const reg = await db.eventRegistration.findFirst({
    where: { id: registrationId, eventId: event.id },
  });
  if (!reg) return { ok: false, error: "Registration not found" };

  const { priceCents, ticketName } = await resolveEventRegistrationPrice(db, {
    eventId: event.id,
    eventPriceCents: event.priceCents,
    ticketTypeId: reg.ticketTypeId,
    promoCode: reg.promoCodeUsed,
    consumePromo: false,
  });

  if (priceCents <= 0) {
    return { ok: false, error: "Registration does not require payment" };
  }

  const lineName = ticketName ? `${event.title} — ${ticketName}` : event.title;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const adapter = getActivePaymentAdapter();

  const checkout = await adapter.startCheckout({
    orgId: org.id,
    ourReference: reg.id,
    successUrl: `${baseUrl}/${orgSlug}/e/${eventSlug}?registered=1`,
    cancelUrl: `${baseUrl}/${orgSlug}/e/${eventSlug}?cancelled=1`,
    customerEmail: reg.guestEmail ?? undefined,
    idempotencyKey: `registration_${reg.id}`,
    items: [
      {
        productRef: reg.ticketTypeId ?? event.id,
        name: lineName,
        amountCents: priceCents,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  if (!checkout.redirectUrl) {
    if (shouldSimulateDemoPayment(adapter.id, checkout.redirectUrl)) {
      await db.eventRegistration.update({
        where: { id: reg.id },
        data: {
          status: "CONFIRMED",
          paidAt: new Date(),
          badgeCode: reg.badgeCode ?? generateBadgeCode(reg.id),
        },
      });
      await writeAuditLog({
        orgId: org.id,
        userId: null,
        action: "registration.paid.demo",
        entity: "EventRegistration",
        entityId: reg.id,
        diff: { adapter: adapter.id, demo: true, amountCents: priceCents },
      });
      return {
        ok: true,
        data: { url: `${baseUrl}/${orgSlug}/e/${eventSlug}?registered=1&paid=1` },
      };
    }
    // Manual adapter: no redirect URL — surface the order id so staff finalize offline.
    return {
      ok: false,
      error: `Manual payment required (adapter=${adapter.id}). Provider ref: ${checkout.providerCheckoutId}`,
    };
  }

  return { ok: true, data: { url: checkout.redirectUrl } };
}
