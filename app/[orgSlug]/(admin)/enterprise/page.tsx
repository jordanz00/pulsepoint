import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { EnterpriseHub } from "@/components/enterprise/enterprise-hub";
import { loadEnterpriseSummary } from "@/lib/enterprise/load-enterprise-summary";

export default async function EnterprisePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const summary = await loadEnterpriseSummary(org.id);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Enterprise AMS"
        subtitle="Hospital association modules—departments, advocacy, committees, and integrations."
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />
      <EnterpriseHub orgSlug={orgSlug} {...summary} />
    </AdminPage>
  );
}
