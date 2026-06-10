import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { HealthSystemGovernanceDashboard } from "@/components/enterprise/health-system-governance-dashboard";
import { loadHealthSystemGovernance } from "@/lib/enterprise/health-system-governance";

export const metadata = {
  title: "Health system governance — PulsePoint",
  description: "Enterprise parent-child hospital hierarchy and governance rollups.",
};

export default async function HealthSystemGovernancePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const data = await loadHealthSystemGovernance(org.id);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Health system governance"
        subtitle="Parent-child hospital hierarchy, roster rollups, and governance signals — live from your tenant."
        badge="alpha"
        backHref={`/${orgSlug}/enterprise`}
        backLabel="Enterprise AMS"
      />
      <HealthSystemGovernanceDashboard orgSlug={orgSlug} data={data} />
    </AdminPage>
  );
}
