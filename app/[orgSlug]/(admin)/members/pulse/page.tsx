import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { MemberPulseOrgDashboard } from "@/components/members/member-pulse-org-dashboard";
import { loadMemberPulseOrgSummary } from "@/lib/member-pulse/org-summary";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

export default async function MemberPulsePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  if (isEasyAdminMode(orgSlug)) notFound();

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const summary = await loadMemberPulseOrgSummary(org.id);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="MemberPulse"
        subtitle="Engagement across association, comms, advocacy, board, and events — per member and org-wide."
        badge="alpha"
        backHref={`/${orgSlug}/members`}
        backLabel="MemberCore"
      />
      <MemberPulseOrgDashboard orgSlug={orgSlug} summary={summary} />
    </AdminPage>
  );
}
