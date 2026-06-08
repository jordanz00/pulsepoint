import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { CommitteeCreateForm } from "@/components/committees/committee-create-form";
import { CommitteeRosterPanel } from "@/components/committees/committee-roster-panel";
import { PageHeader } from "@/components/ui/page-header";
import {
  loadCommitteeMemberOptions,
  loadCommitteeRoster,
} from "@/lib/committees/load-committees";
import { requirePageCapability } from "@/lib/admin-page-guard";
import { roleAllows } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function CommitteesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requirePageCapability(orgSlug, "committee:read");
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const canWrite = roleAllows("committee:write", staff.role);
  const [committees, memberOptions] = await Promise.all([
    loadCommitteeRoster(org.id),
    loadCommitteeMemberOptions(org.id),
  ]);

  const activeCount = committees.filter((c) => c.isActive).length;
  const memberCount = committees.reduce((n, c) => n + c.memberships.length, 0);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Committees & governance"
        subtitle="Standing committees, councils, and current rosters — tied to MemberCore records."
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <div className="pp-module-stats glass mb-6">
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{activeCount}</span>
          <span className="pp-module-stat-label">Active committees</span>
        </div>
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{memberCount}</span>
          <span className="pp-module-stat-label">Roster seats</span>
        </div>
        <div className="pp-module-stat">
          <span className="pp-module-stat-value">{committees.length}</span>
          <span className="pp-module-stat-label">Total committees</span>
        </div>
      </div>

      {canWrite ? <CommitteeCreateForm orgSlug={orgSlug} /> : null}

      <CommitteeRosterPanel
        orgSlug={orgSlug}
        committees={committees}
        memberOptions={memberOptions}
        canWrite={canWrite}
      />
    </AdminPage>
  );
}
