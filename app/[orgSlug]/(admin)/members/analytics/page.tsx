import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadMembershipAnalytics } from "@/lib/membership-analytics";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { MembershipAnalyticsDashboard } from "@/components/insights/membership-analytics-dashboard";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

export const dynamic = "force-dynamic";

export default async function MemberAnalyticsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const data = await loadMembershipAnalytics(org.id);
  const easy = isEasyAdminMode(orgSlug);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Membership analytics"
        subtitle={
          easy
            ? "Renewals, engagement, and hospital accounts in one view."
            : "Board-ready membership intelligence—renewal pipeline, tiers, engagement, and hospital roster."
        }
        backHref={`/${orgSlug}/members`}
        backLabel="MemberCore"
        badge="alpha"
      />
      <MembershipAnalyticsDashboard data={data} orgSlug={orgSlug} />
    </AdminPage>
  );
}
