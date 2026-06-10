import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { loadAdvocacyDashboardStats } from "@/lib/advocacy-dashboard";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { AdvocacyCampaignBoard } from "@/components/enterprise/advocacy-campaign-os";
import type { AdvocacyCampaignRecord } from "@/lib/advocacy-campaign-ops";

export default async function AdvocacyCampaignsIndexPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const [rows, stats] = await Promise.all([
    db.advocacyCampaign.findMany({
      where: { orgId: org.id },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: { issue: { select: { title: true, billNumber: true, status: true } } },
    }),
    loadAdvocacyDashboardStats(org.id),
  ]);

  const campaigns: AdvocacyCampaignRecord[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.isActive,
    audienceId: c.audienceId,
    responseCount: c.responseCount,
    targetCount: c.targetCount,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    createdAt: c.createdAt,
    issue: c.issue,
  }));

  const activeCount = campaigns.filter((c) => c.isActive).length;

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Advocacy campaigns"
        subtitle={`${activeCount} active · ${stats.hospitalsWithTakeActionResponse} hospitals with take-action responses · campaign operating system`}
        badge="alpha"
        backHref={`/${orgSlug}/enterprise/advocacy`}
        backLabel="Advocacy"
        actions={
          <Link href={`/${orgSlug}/enterprise/advocacy`} className="pc-btn-secondary">
            Advocacy hub
          </Link>
        }
      />

      <AdvocacyCampaignBoard orgSlug={orgSlug} campaigns={campaigns} />
    </AdminPage>
  );
}
