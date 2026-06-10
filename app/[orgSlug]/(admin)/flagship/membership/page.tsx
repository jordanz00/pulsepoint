import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipMembershipHub } from "@/components/showcase/flagship-membership-hub";
import { loadFlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";
import { loadCeoCommandCenter } from "@/lib/ceo-command-center-data";

export const metadata = {
  title: "Membership Intelligence — Flagship",
};

export default async function FlagshipMembershipPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [stats, ceo] = await Promise.all([
    loadFlagshipFeatureStats(org.id, orgSlug, org.name),
    loadCeoCommandCenter(org.id, orgSlug, org.name),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Membership Intelligence"
        subtitle="Analytics and MemberPulse on one member graph."
        badge="alpha"
        backHref={`/${orgSlug}/flagship`}
        backLabel="Flagship features"
      />
      <FlagshipMembershipHub
        orgSlug={orgSlug}
        stat={stats["membership-intelligence"]!}
        activeMembers={ceo.members.total}
        renewalsDue30={ceo.members.renewalsDue30}
      />
    </AdminPage>
  );
}
