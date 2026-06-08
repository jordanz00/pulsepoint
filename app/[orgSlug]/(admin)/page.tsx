import { DemoHomeDashboard } from "@/components/admin/demo-home-dashboard";
import { OverviewDashboard } from "@/components/admin/overview-dashboard";
import { isEasyAdminMode } from "@/lib/admin-page-copy";
import { prisma } from "@/lib/prisma";

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  if (isEasyAdminMode(orgSlug)) {
    return <DemoHomeDashboard orgSlug={orgSlug} />;
  }

  return <OverviewDashboard orgSlug={orgSlug} orgName={org.name} />;
}
