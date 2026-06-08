import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { memberTagsArray } from "@/lib/member-tags";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { MemberProfileHeader } from "@/components/members/member-profile-header";
import { MemberMembershipCard } from "@/components/members/member-membership-card";
import { MemberProfileView } from "@/components/members/member-profile-view";
import { DeleteMemberButton } from "@/components/members/delete-member-button";
import { RecomputeEngagementButton } from "@/components/members/recompute-engagement-button";
import { loadMemberFormOptions } from "@/lib/member-form-options";
import { loadMemberProfile } from "@/lib/member-profile/load-member-profile";
import { isEasyAdminMode } from "@/lib/admin-page-copy";
import { ensureDefaultCrmWorkflows } from "@/app/actions/crm";
import { ensureDefaultDealPipeline } from "@/app/actions/deals";
import { MemberPortalLinkPanel } from "@/components/members/member-portal-link-panel";
import { MemberWorkforceLearnPanel } from "@/components/members/member-workforce-learn-panel";
import { roleAllows } from "@/lib/permissions";
import { requireOrgAccessForSlug } from "@/lib/auth";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; memberId: string }>;
}) {
  const { orgSlug, memberId } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const canWriteMember = roleAllows("member:write", staff.role);
  const canExportTranscript = roleAllows("learn:manage", staff.role);
  const easy = isEasyAdminMode(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  if (!easy) {
    await Promise.all([ensureDefaultCrmWorkflows(orgSlug), ensureDefaultDealPipeline(orgSlug)]);
  }

  const profile = await loadMemberProfile(org.id, orgSlug, memberId);
  if (!profile) notFound();

  const formOptions = easy ? undefined : await loadMemberFormOptions(org.id);

  const db = getOrgDb(org.id);
  const memberRow = await db.member.findFirst({
    where: { id: memberId },
    include: { tier: true, organizationAccount: true },
  });
  if (!memberRow) notFound();

  const [programEnrollments, suggestedPlaylists] = await Promise.all([
    db.learnProgramEnrollment.findMany({
      where: { orgId: org.id, memberId },
      include: { program: { select: { title: true } } },
      take: 5,
    }),
    db.learnVideoPlaylist.findMany({
      where: { orgId: org.id },
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
  ]);

  const membershipCard = (
    <MemberMembershipCard
      member={memberRow}
      tier={memberRow.tier}
      organizationAccount={memberRow.organizationAccount}
      orgSlug={orgSlug}
    />
  );

  const summaryHeader = (
    <MemberProfileHeader member={memberRow} roles={profile.roles} />
  );

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={`${profile.member.firstName} ${profile.member.lastName}`}
        subtitle={
          easy
            ? "One-screen story — tags, registrations, notes, and membership at a glance"
            : "Summary shows tags, event registrations, and notes on one screen — deeper tabs for roles, billing, and CRM"
        }
        backHref={`/${orgSlug}/members`}
        backLabel="MemberCore"
        badge={easy ? undefined : "live"}
      />

      {!easy ? (
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          <RecomputeEngagementButton orgSlug={orgSlug} memberId={profile.member.id} />
          <DeleteMemberButton orgSlug={orgSlug} memberId={profile.member.id} />
        </div>
      ) : null}

      <MemberPortalLinkPanel
        orgSlug={orgSlug}
        memberId={memberRow.id}
        memberEmail={memberRow.email}
        clerkUserId={memberRow.clerkUserId}
        canWrite={canWriteMember}
      />

      <MemberWorkforceLearnPanel
        orgSlug={orgSlug}
        memberId={memberRow.id}
        memberName={`${memberRow.firstName} ${memberRow.lastName}`.trim()}
        canExportTranscript={canExportTranscript}
        workforcePersona={memberRow.workforcePersona}
        enrollments={programEnrollments.map((e) => ({
          programTitle: e.program.title,
          status: e.status,
        }))}
        suggestedPlaylists={suggestedPlaylists.map((p) => ({
          trackSlug: p.trackSlug,
          title: p.title,
          itemCount: p._count.items,
        }))}
      />

      <MemberProfileView
        data={profile}
        orgSlug={orgSlug}
        easy={easy}
        formOptions={formOptions}
        membershipCard={membershipCard}
        summaryHeader={summaryHeader}
        memberFormInitial={
          formOptions
            ? {
                firstName: memberRow.firstName,
                lastName: memberRow.lastName,
                email: memberRow.email ?? undefined,
                phone: memberRow.phone ?? undefined,
                status: memberRow.status,
                tags: memberTagsArray(memberRow.tags),
                company: memberRow.company ?? undefined,
                jobTitle: memberRow.jobTitle ?? undefined,
                tierId: memberRow.tierId ?? undefined,
                renewalDueAt: memberRow.renewalDueAt?.toISOString(),
                organizationAccountId: memberRow.organizationAccountId ?? undefined,
                relationshipHealth: memberRow.relationshipHealth,
              }
            : undefined
        }
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/${orgSlug}/members`} className="pc-btn-secondary">
          Back to directory
        </Link>
        {!easy ? (
          <Link href={`/${orgSlug}/members/new`} className="pc-btn-primary">
            Add member
          </Link>
        ) : null}
      </div>
    </AdminPage>
  );
}
