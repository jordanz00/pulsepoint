import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import {
  CrmOpsBrief,
  CrmOperatorPanels,
  CrmQuickPaths,
  CrmRelationshipQueue,
} from "@/components/enterprise/crm-ops-center";
import { ensureDefaultCrmWorkflows } from "@/app/actions/crm";
import { loadCrmOpsSnapshot } from "@/lib/crm-ops";

export default async function CrmHubPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultCrmWorkflows(orgSlug);
  const snapshot = await loadCrmOpsSnapshot(org.id);
  const queueSize = snapshot.overdueFollowUps + snapshot.atRiskCount;

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="CRM"
        subtitle={`${snapshot.activeMembers} active members · ${queueSize} item${queueSize === 1 ? "" : "s"} in relationship queue · hospital association CRM`}
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="crm" />

      <CrmOpsBrief snapshot={snapshot} orgSlug={orgSlug} />
      <CrmOperatorPanels snapshot={snapshot} orgSlug={orgSlug} />

      <div className="pp-crm-hub-grid">
        <CrmRelationshipQueue snapshot={snapshot} orgSlug={orgSlug} />
        <CrmQuickPaths orgSlug={orgSlug} />
      </div>
    </AdminPage>
  );
}
