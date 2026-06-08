/**
 * Portal account linking — connect Clerk users to Member records by email.
 */

import type { Member } from "@/app/generated/prisma/client";
import type { getOrgDb } from "@/lib/db";

type OrgDb = ReturnType<typeof getOrgDb>;

export type PortalLinkCandidate = {
  id: string;
  clerkUserId: string | null;
  email: string | null;
};

export type EmailLinkEvaluation =
  | { ok: true; memberId: string }
  | { ok: false; reason: "no_match" | "ambiguous" | "already_linked" };

export function normalizeMemberEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Pure guard — exactly one email match and not linked to another Clerk user. */
export function evaluateEmailLink(
  candidates: PortalLinkCandidate[],
  clerkUserId: string,
  email: string,
): EmailLinkEvaluation {
  const norm = normalizeMemberEmail(email);
  const matches = candidates.filter(
    (m) => m.email && normalizeMemberEmail(m.email) === norm,
  );
  if (matches.length === 0) return { ok: false, reason: "no_match" };
  if (matches.length > 1) return { ok: false, reason: "ambiguous" };
  const target = matches[0]!;
  if (target.clerkUserId && target.clerkUserId !== clerkUserId) {
    return { ok: false, reason: "already_linked" };
  }
  return { ok: true, memberId: target.id };
}

export async function clerkUserIdTakenInOrg(
  db: OrgDb,
  orgId: string,
  clerkUserId: string,
  exceptMemberId?: string,
): Promise<boolean> {
  const existing = await db.member.findFirst({
    where: {
      orgId,
      clerkUserId,
      ...(exceptMemberId ? { id: { not: exceptMemberId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

/**
 * Auto-link on portal visit when signed-in user email matches one member row.
 */
export async function tryAutoLinkPortalMember(
  db: OrgDb,
  orgId: string,
  clerkUserId: string,
  email: string,
): Promise<{ ok: true; member: Member } | { ok: false }> {
  if (await clerkUserIdTakenInOrg(db, orgId, clerkUserId)) {
    return { ok: false };
  }

  const candidates = await db.member.findMany({
    where: { orgId, email: { not: null } },
    select: { id: true, clerkUserId: true, email: true },
    take: 500,
  });

  const evaluation = evaluateEmailLink(candidates, clerkUserId, email);
  if (!evaluation.ok) return { ok: false };

  const member = await db.member.update({
    where: { id: evaluation.memberId },
    data: { clerkUserId },
  });

  return { ok: true, member };
}
