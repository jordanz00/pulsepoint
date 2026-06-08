import { notFound } from "next/navigation";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { InsightsFeed } from "@/components/intelligence/insights-feed";
import { ADMIN_PAGES, pageSubtitle } from "@/lib/admin-page-copy";

export const metadata = {
  title: "AMS Intelligence — PulsePoint",
  description: "Proactive membership, event, sponsorship, advocacy, and committee insights.",
};

export default async function IntelligencePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={ADMIN_PAGES.intelligence.title}
        subtitle={pageSubtitle(orgSlug, "intelligence")}
      />
      <div className="intel-page">
        <InsightsFeed orgSlug={orgSlug} showHeader={false} />
      </div>
    </AdminPage>
  );
}
