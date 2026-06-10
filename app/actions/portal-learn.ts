"use server";

/**
 * Member portal Learn — self-service CE transcript export (alpha).
 * SECURITY: resolvePortalMember only — members export their own record.
 */

import { writeAuditLog } from "@/lib/audit";
import { getOrgDb } from "@/lib/db";
import { buildMemberTranscriptCsv } from "@/lib/learn/transcript-csv";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { messageFromActionError } from "@/lib/action-errors";
import type { ActionResult } from "@/app/actions/members";

export async function exportPortalTranscriptCsv(
  orgSlug: string,
): Promise<ActionResult<{ csv: string; enrollmentCount: number; awardCount: number }>> {
  try {
    const ctx = await resolvePortalMember(orgSlug);
    if (!ctx.ok) return { ok: false, error: ctx.error };

    const db = getOrgDb(ctx.org.id);
    const member = ctx.member;

    const [enrollments, awards] = await Promise.all([
      db.courseEnrollment.findMany({
        where: { orgId: ctx.org.id, memberId: member.id },
        include: { course: { select: { title: true } } },
        orderBy: { enrolledAt: "asc" },
      }),
      db.cECreditAward.findMany({
        where: { orgId: ctx.org.id, memberId: member.id },
        include: { creditType: { select: { code: true, name: true } } },
        orderBy: { awardedAt: "asc" },
      }),
    ]);

    const csv = buildMemberTranscriptCsv({
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      memberEmail: member.email ?? "",
      enrollments: enrollments.map((e) => ({
        courseTitle: e.course.title,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt?.toISOString() ?? "",
      })),
      awards: awards.map((a) => ({
        creditCode: a.creditType.code,
        creditName: a.creditType.name,
        amount: a.amount,
        source: a.source,
        awardedAt: a.awardedAt.toISOString(),
        note: a.note ?? "",
      })),
    });

    await writeAuditLog({
      orgId: ctx.org.id,
      userId: ctx.userId,
      action: "portal.learn.transcript.export",
      entity: "Member",
      entityId: member.id,
      diff: { enrollmentCount: enrollments.length, awardCount: awards.length },
    });

    return {
      ok: true,
      data: {
        csv,
        enrollmentCount: enrollments.length,
        awardCount: awards.length,
      },
    };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
