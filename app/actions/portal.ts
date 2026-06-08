"use server";

/**
 * Member portal actions — profile updates for linked members.
 */

import { revalidatePath } from "next/cache";
import { getOrgDb } from "@/lib/db";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { memberInputSchema } from "@/lib/validations/member";
import type { ActionResult } from "@/app/actions/members";

export async function updatePortalProfile(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  const ctx = await resolvePortalMember(orgSlug);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = memberInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid profile data" };
  }

  const { member } = ctx;
  const db = getOrgDb(ctx.org.id);

  await db.member.update({
    where: { id: member.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath(`/${orgSlug}/portal`);
  return { ok: true };
}
