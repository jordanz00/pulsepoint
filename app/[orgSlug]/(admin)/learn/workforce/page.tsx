import Link from "next/link";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { LearnWorkforceShell } from "@/components/learn/learn-workforce-shell";

export const dynamic = "force-dynamic";

export default async function LearnWorkforcePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const db = getOrgDb(staff.orgId);

  const [playlists, programs, careerFairs, members] = await Promise.all([
    db.learnVideoPlaylist.findMany({
      where: { orgId: staff.orgId },
      include: {
        _count: { select: { items: true } },
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            videoUrl: true,
            durationMin: true,
            ceEligible: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.learnWorkforceProgram.findMany({
      where: { orgId: staff.orgId },
      include: {
        _count: { select: { enrollments: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.event.findMany({
      where: { orgId: staff.orgId, eventKind: "VIRTUAL_CAREER_FAIR" },
      orderBy: { startsAt: "desc" },
      take: 10,
    }),
    db.member.findMany({
      where: { orgId: staff.orgId, status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true, workforcePersona: true },
      orderBy: { lastName: "asc" },
      take: 40,
    }),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Workforce & virtual career fair"
        subtitle="Learn alpha — playlists, pipeline programs, career fair event shell, and member persona fields."
        badge="alpha"
        backHref={`/${orgSlug}/learn`}
        backLabel="Learn"
        actions={
          <>
            <Link href={`/${orgSlug}/learn/library`} className="pc-btn-secondary" target="_blank" rel="noopener noreferrer">
              Video library
            </Link>
            <Link href={`/${orgSlug}/events`} className="pc-btn-secondary">
              Events
            </Link>
          </>
        }
      />
      <LearnWorkforceShell
        orgSlug={orgSlug}
        playlists={playlists.map((p) => ({
          id: p.id,
          title: p.title,
          trackSlug: p.trackSlug,
          itemCount: p._count.items,
          items: p.items,
        }))}
        programs={programs.map((p) => ({
          id: p.id,
          title: p.title,
          programType: p.programType,
          status: p.status,
          enrollmentCount: p._count.enrollments,
          eventTitle: p.event?.title ?? null,
        }))}
        careerFairs={careerFairs.map((e) => ({
          id: e.id,
          title: e.title,
          publicSlug: e.publicSlug,
          status: e.status,
        }))}
        members={members.map((m) => ({
          id: m.id,
          label: `${m.firstName} ${m.lastName}`.trim(),
          workforcePersona: m.workforcePersona,
        }))}
      />
    </AdminPage>
  );
}
