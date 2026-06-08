import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ProspectorInstallCards } from "@/components/crm/prospector-install-cards";
import { ProspectorBookmarklet } from "@/components/crm/prospector-bookmarklet";
import { WebCaptureSetup } from "@/components/crm/web-capture-setup";
import Link from "next/link";

export default async function ProspectorHubPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const features = [
    {
      title: "Prepare for every interaction",
      body: "Rich contact context and team notes without tab-hopping — from inbox or any website.",
    },
    {
      title: "Build pipeline anywhere",
      body: "Capture enriched records with firmographics and ICP fit in one click.",
    },
    {
      title: "Streamlined follow-ups",
      body: "Log notes, Stay in Touch reminders, and open full profiles from the browser.",
    },
    {
      title: "Automated enrichment",
      body: "Industry, size, revenue band, and social profiles — demo rules today, IT APIs tomorrow.",
    },
  ];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="PulsePoint Prospector"
        subtitle="Prospect, enrich, and engage — anywhere you work."
        backHref={`/${orgSlug}/crm`}
        backLabel="CRM"
      />

      <div className="mb-6">
        <Link
          href={`/${orgSlug}/crm/prospector/panel`}
          className="pc-btn-primary inline-block text-sm"
        >
          Open Prospector panel →
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="pc-glass-panel rounded-xl p-5">
            <h2 className="font-semibold text-zinc-900">{f.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{f.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Install extensions</h2>
      <ProspectorInstallCards orgSlug={orgSlug} />

      <div className="mt-8 space-y-6">
        <ProspectorBookmarklet orgId={org.id} orgSlug={orgSlug} />
        <WebCaptureSetup orgId={org.id} orgSlug={orgSlug} />
      </div>
    </AdminPage>
  );
}
