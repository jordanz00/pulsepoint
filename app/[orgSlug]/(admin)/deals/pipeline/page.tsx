import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { DealPipelineInteractive } from "@/components/deals/deal-pipeline-interactive";
import { CreateDealForm } from "@/components/deals/create-deal-form";
import { listDeals, ensureDefaultDealPipeline } from "@/app/actions/deals";

export const dynamic = "force-dynamic";

export default async function DealPipelinePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultDealPipeline(orgSlug);
  const res = await listDeals(orgSlug);
  const deals = res.ok ? res.data : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Partnership pipeline"
        subtitle="Drag partnership opportunities between stages — updates feed executive dashboards automatically."
        badge="alpha"
        backHref={`/${orgSlug}/deals`}
        backLabel="Partnerships"
      />
      <CreateDealForm orgSlug={orgSlug} />
      <DealPipelineInteractive orgSlug={orgSlug} deals={deals} />
    </AdminPage>
  );
}
