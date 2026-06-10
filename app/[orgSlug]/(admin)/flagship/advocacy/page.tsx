import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipAdvocacyHub } from "@/components/showcase/flagship-advocacy-hub";
import { loadFlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";
import { loadAdvocacyDashboardStats } from "@/lib/advocacy-dashboard";

export const metadata = {
  title: "Advocacy on One Roster — Flagship",
};

export default async function FlagshipAdvocacyPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [stats, advocacy] = await Promise.all([
    loadFlagshipFeatureStats(org.id, orgSlug, org.name),
    loadAdvocacyDashboardStats(org.id),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Advocacy on One Roster"
        subtitle="Issue campaigns linked to hospital accounts on MemberCore."
        badge="alpha"
        backHref={`/${orgSlug}/flagship`}
        backLabel="Flagship features"
      />
      <FlagshipAdvocacyHub
        orgSlug={orgSlug}
        stat={stats["advocacy-one-roster"]!}
        advocacy={advocacy}
      />
    </AdminPage>
  );
}
