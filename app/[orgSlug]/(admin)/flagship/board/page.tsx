import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipBoardHub } from "@/components/showcase/flagship-board-hub";
import { loadFlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";

export const metadata = {
  title: "Board Briefing Pack — Flagship",
};

export default async function FlagshipBoardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const stats = await loadFlagshipFeatureStats(org.id, orgSlug, org.name);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Board Briefing Pack"
        subtitle="Printable board export and KPI widget board."
        badge="alpha"
        backHref={`/${orgSlug}/flagship`}
        backLabel="Flagship features"
      />
      <FlagshipBoardHub orgSlug={orgSlug} stat={stats["board-briefing-pack"]!} />
    </AdminPage>
  );
}
