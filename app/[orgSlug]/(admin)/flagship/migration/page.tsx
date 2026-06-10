import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipMigrationHub } from "@/components/showcase/flagship-migration-hub";
import { loadFlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";

export const metadata = {
  title: "Migration Without Rip-and-Replace — Flagship",
};

export default async function FlagshipMigrationPage({
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
        title="Migration Without Rip-and-Replace"
        subtitle="CSV import staging and honest Protech comparison."
        badge="alpha"
        backHref={`/${orgSlug}/flagship`}
        backLabel="Flagship features"
      />
      <FlagshipMigrationHub orgSlug={orgSlug} stat={stats["migration-honest"]!} />
    </AdminPage>
  );
}
