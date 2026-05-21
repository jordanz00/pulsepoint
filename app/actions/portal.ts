"use server";

/**
 * Member portal actions — PulseCore Phase 3
 */

import { auth } from "@clerk/nextjs/server";
import { getOrgDb, prisma } from "@/lib/db";
import { memberInputSchema } from "@/lib/validations/member";
import type { ActionResult } from "@/app/actions/members";

export async function getPortalProfile(
  orgSlug: string,
): Promise<
  ActionResult<{
    member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string | null;
    };
    registrations: Array<{
      id: string;
      status: string;
      paidAt: Date | null;
      event: { title: string; startsAt: Date; publicSlug: string };
    }>;
  }>
> {
  const session = await auth();
  if (!session.userId) {
    return { ok: false, error: "Sign in required" };
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const member = await db.member.findFirst({
    where: { clerkUserId: session.userId },
  });

  if (!member) {
    return { ok: false, error: "No member profile linked to this account" };
  }

  const registrations = await db.eventRegistration.findMany({
    where: { memberId: member.id },
    include: { event: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    ok: true,
    data: {
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
      },
      registrations: registrations.map((r) => ({
        id: r.id,
        status: r.status,
        paidAt: r.paidAt,
        event: {
          title: r.event.title,
          startsAt: r.event.startsAt,
          publicSlug: r.event.publicSlug,
        },
      })),
    },
  };
}

export async function updatePortalProfile(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  const session = await auth();
  if (!session.userId) {
    return { ok: false, error: "Sign in required" };
  }

  const parsed = memberInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid profile data" };
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) return { ok: false, error: "Organization not found" };

  const db = getOrgDb(org.id);
  const member = await db.member.findFirst({
    where: { clerkUserId: session.userId },
  });
  if (!member) {
    return { ok: false, error: "No member profile linked" };
  }

  await db.member.update({
    where: { id: member.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    },
  });

  return { ok: true };
}
