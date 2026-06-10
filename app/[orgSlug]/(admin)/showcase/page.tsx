import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { Top20Showcase } from "@/components/showcase/top-20-showcase";
import { loadTop20FeatureStats } from "@/lib/load-top-20-feature-stats";

export const metadata = {
  title: "Top 20 Feature Showcase — PulsePoint",
  description: "Highly visible AMS features with live tenant stats and demo links.",
};

export default async function Top20ShowcasePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const stats = await loadTop20FeatureStats(org.id, orgSlug, org.name);
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
        title="Top 20 showcase"
        subtitle="Every flagship feature — live stat, honest status label, one-click demo."
        badge="live"
        backHref={`/${orgSlug}`}
        backLabel="Overview"
      />
      <Top20Showcase orgSlug={orgSlug} stats={stats} dataAsOf={dataAsOf} />
    </AdminPage>
  );
}
