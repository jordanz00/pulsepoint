import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { CommitteeEditForm } from "@/components/committees/committee-edit-form";
import { CommitteeMeetingsPanel } from "@/components/committees/committee-meetings-panel";
import { CommitteeOfficersPanel } from "@/components/committees/committee-officers-panel";
import { CommitteeRosterPanel } from "@/components/committees/committee-roster-panel";
import { PageHeader } from "@/components/ui/page-header";
import { countUpcomingMeetings } from "@/lib/committees/meeting-policy";
import { isOfficerRole } from "@/lib/committees/officer-roles";
import {
  loadCommitteeDetail,
  loadCommitteeMemberOptions,
} from "@/lib/committees/load-committees";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { roleAllows } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const KIND_LABELS: Record<string, string> = {
  STANDING: "Standing",
  ADVISORY: "Advisory",
  TASK_FORCE: "Task force",
  COUNCIL: "Council",
};

export default async function CommitteeDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; committeeId: string }>;
}) {
  const { orgSlug, committeeId } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  if (!roleAllows("committee:read", staff.role)) {
    notFound();
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [committee, memberOptions] = await Promise.all([
    loadCommitteeDetail(org.id, committeeId),
    loadCommitteeMemberOptions(org.id),
  ]);
  if (!committee) notFound();

  const canWrite = roleAllows("committee:write", staff.role);
  const officerCount = committee.memberships.filter((m) =>
    isOfficerRole(m.officerRole),
  ).length;
  const upcomingMeetings = countUpcomingMeetings(committee.meetings);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={committee.name}
        subtitle={`${KIND_LABELS[committee.kind] ?? committee.kind} · ${committee.departmentId.replace(/_/g, " ")}${committee.isActive ? "" : " · Inactive"}`}
        backHref={`/${orgSlug}/committees`}
        backLabel="Committees"
      />

      {committee.description ? (
        <p className="ds-page-subtitle mb-6">{committee.description}</p>
      ) : null}

      <div className="pp-module-stats glass mb-6">
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{committee.memberships.length}</span>
          <span className="pp-module-stat-label">Roster members</span>
        </div>
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{officerCount}</span>
          <span className="pp-module-stat-label">Officers</span>
        </div>
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{upcomingMeetings}</span>
          <span className="pp-module-stat-label">Upcoming meetings</span>
        </div>
      </div>

      <div className="committee-detail">
        {canWrite ? <CommitteeEditForm orgSlug={orgSlug} committee={committee} /> : null}

        <CommitteeOfficersPanel
          orgSlug={orgSlug}
          committeeId={committee.id}
          memberships={committee.memberships}
          canWrite={canWrite}
        />

        <CommitteeRosterPanel
          orgSlug={orgSlug}
          committees={[committee]}
          memberOptions={memberOptions}
          canWrite={canWrite}
          detailMode
        />

        <CommitteeMeetingsPanel
          orgSlug={orgSlug}
          committeeId={committee.id}
          meetings={committee.meetings}
          canWrite={canWrite}
        />
      </div>

      {!canWrite ? (
        <p className="ds-page-subtitle mt-6">
          View-only access. Contact an administrator to edit committees.
        </p>
      ) : null}

      <p className="ds-page-subtitle mt-4">
        <Link href={`/${orgSlug}/committees`} className="ds-page-eyebrow">
          ← All committees
        </Link>
      </p>
    </AdminPage>
  );
}
