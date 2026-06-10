import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipShowcase } from "@/components/showcase/flagship-showcase";
import { loadFlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";

export const metadata = {
  title: "Flagship Features — PulsePoint",
  description:
    "Five buyer-facing capabilities with live tenant stats and honest scope labels.",
};

export default async function FlagshipHubPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const stats = await loadFlagshipFeatureStats(org.id, orgSlug, org.name);
  const dataAsOf = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Flagship features"
        subtitle="Sales-ready demo — live stat, honest status, one-click hub per capability."
        badge="live"
        backHref={`/${orgSlug}`}
        backLabel="Overview"
      />
      <FlagshipShowcase orgSlug={orgSlug} stats={stats} dataAsOf={dataAsOf} />
    </AdminPage>
  );
}
