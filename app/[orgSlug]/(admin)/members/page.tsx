import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import { AdminPage } from "@/components/admin/admin-page";
import { MemberImportExport } from "@/components/members/member-import-export";
import { MemberDirectoryFilters } from "@/components/members/member-directory-filters";
import { MemberCoreHub } from "@/components/members/membercore-hub";
import { GeneralMembersFacilityPanel } from "@/components/members/general-members-facility-panel";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AtRiskPanel } from "@/components/members/at-risk-panel";
import { MemberDirectoryBulk } from "@/components/members/member-directory-bulk";
import { MemberDirectoryVirtual } from "@/components/members/member-directory-virtual";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { getMembers } from "@/app/actions/members";
import { requireOrgAccessForSlug } from "@/lib/auth";
import {
  ADMIN_PAGES,
  isEasyAdminMode,
  pageSubtitle,
} from "@/lib/admin-page-copy";
import {
  buildMemberListWhere,
  roleFilterSummary,
} from "@/lib/member-role-filters";
import { parseMemberSearchFromQuery } from "@/lib/validations/member";
import {
  memberHasCSuite,
  memberHasExternalBoard,
  memberHasOurBoard,
} from "@/lib/member-roles";

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orgSlug } = await params;
  const rawSearch = await searchParams;
  const easy = isEasyAdminMode(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const filters = parseMemberSearchFromQuery(rawSearch);
  const filterLabel = roleFilterSummary(filters);

  const db = getOrgDb(org.id);
  const [members, atRisk, engagementActive, engagementAtRisk] = await Promise.all([
    db.member.findMany({
      where: buildMemberListWhere(filters),
      select: {
        id: true,
        orgId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        company: true,
        jobTitle: true,
        tags: true,
        engagementScore: true,
        engagementTier: true,
        roles: {
          where: { isCurrent: true },
          orderBy: [{ leadershipLevel: "asc" }, { title: "asc" }],
          select: {
            id: true,
            category: true,
            scope: true,
            leadershipLevel: true,
            title: true,
            organizationName: true,
            isCurrent: true,
            startDate: true,
            endDate: true,
            notes: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: easy ? 100 : 200,
    }),
    easy
      ? Promise.resolve([])
      : db.member.findMany({
          where: { orgId: org.id, engagementTier: "at_risk" },
          orderBy: { engagementScore: "asc" },
          take: 8,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            engagementScore: true,
            renewalDueAt: true,
          },
        }),
    db.member.count({ where: { orgId: org.id, engagementTier: "active" } }),
    db.member.count({ where: { orgId: org.id, engagementTier: "at_risk" } }),
  ]);
  assertAllRowsBelongToOrg(members, org.id, "members-page");

  const staff = await requireOrgAccessForSlug(orgSlug);
  const directoryPage = await getMembers(
    {
      take: 50,
      q: filters.q,
      status: filters.status,
    },
    orgSlug,
  );
  const directoryInitial =
    directoryPage.ok && directoryPage.data
      ? directoryPage.data
      : { members: [], nextCursor: null, totalCount: members.length };

  const hubStats = {
    total: directoryInitial.totalCount || members.length,
    active: engagementActive,
    atRisk: engagementAtRisk,
    cSuite: members.filter((m) => memberHasCSuite(m.roles)).length,
    ourBoard: members.filter((m) => memberHasOurBoard(m.roles)).length,
  };

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={ADMIN_PAGES.members.title}
        subtitle={pageSubtitle(orgSlug, "members")}
        badge={easy ? undefined : "live"}
        backHref={easy ? `/${orgSlug}` : undefined}
        backLabel="Home"
        actions={
          <>
            <Link href={`/${orgSlug}/members/analytics`} className="pc-btn-secondary">
              Analytics
            </Link>
            <Link href={`/${orgSlug}/enterprise/organizations`} className="pc-btn-secondary">
              Hospital accounts
            </Link>
            {!easy ? (
              <Link href={`/${orgSlug}/members/pulse`} className="pc-btn-secondary">
                MemberPulse
              </Link>
            ) : null}
            <Link href={`/${orgSlug}/members/new`} className="pc-btn-primary">
              Add member
            </Link>
          </>
        }
      />

      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="members" />

      <MemberCoreHub orgSlug={orgSlug} stats={hubStats} />

      <div className="mb-8">
        <GeneralMembersFacilityPanel orgId={org.id} orgSlug={orgSlug} compact />
      </div>

      <MemberDirectoryFilters orgSlug={orgSlug} values={filters} />

      {filterLabel ? (
        <p className="mc-filter-status" role="status" aria-live="polite">
          {filterLabel} · {members.length} member{members.length === 1 ? "" : "s"} in this view
        </p>
      ) : null}

      <MemberImportExport orgSlug={orgSlug} simple={easy} />

      {!easy ? (
        <>
          <AtRiskPanel orgSlug={orgSlug} members={atRisk} />
        </>
      ) : null}

      {members.length === 0 ? (
        <EmptyState
          title="No members match"
          description={
            filterLabel
              ? "Try a different role or engagement filter, or clear all filters."
              : "Add someone by hand or upload a spreadsheet."
          }
          action={
            filterLabel ? (
              <Link href={`/${orgSlug}/members`} className="pc-btn-secondary">
                Clear filters
              </Link>
            ) : (
              <Link href={`/${orgSlug}/members/new`} className="pc-btn-primary">
                Add member
              </Link>
            )
          }
        />
      ) : filterLabel ? (
        <MemberDirectoryBulk
          orgSlug={orgSlug}
          members={members.map((m) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            status: m.status,
            company: m.company,
            jobTitle: m.jobTitle,
            tags: m.tags,
            roles: m.roles,
            engagementScore: m.engagementScore,
            engagementTier: m.engagementTier,
          }))}
        />
      ) : (
        <MemberDirectoryVirtual
          orgSlug={orgSlug}
          initialMembers={directoryInitial.members}
          initialCursor={directoryInitial.nextCursor}
          initialTotal={directoryInitial.totalCount}
          canExport={staff.role === "ADMIN" || staff.role === "OWNER"}
        />
      )}
    </AdminPage>
  );
}
