import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { OrganizationForm } from "@/components/enterprise/organization-form";

export default async function NewOrganizationPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const parents = await db.memberOrganization.findMany({
    where: { orgId: org.id, type: "HEALTH_SYSTEM" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Add hospital account"
        subtitle="Create a hospital or health system account for member roster rollups."
        backHref={`/${orgSlug}/enterprise/organizations`}
        backLabel="Hospital accounts"
      />
      <OrganizationForm orgSlug={orgSlug} parentOptions={parents} />
    </AdminPage>
  );
}
