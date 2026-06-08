import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProspectorPanel } from "@/components/crm/prospector-panel";

export default async function ProspectorPanelPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { orgSlug } = await params;
  const { email } = await searchParams;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">
          PulsePoint Prospector
        </p>
        <h1 className="text-xl font-semibold text-zinc-900">{org.name}</h1>
      </header>
      <ProspectorPanel orgSlug={orgSlug} orgId={org.id} initialEmail={email} />
    </div>
  );
}
