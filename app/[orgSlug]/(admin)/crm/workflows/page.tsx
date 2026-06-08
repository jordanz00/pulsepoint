import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ensureDefaultCrmWorkflows, listCrmWorkflows } from "@/app/actions/crm";
import { WORKFLOW_TEMPLATES } from "@/lib/crm/workflow-templates";
import { resolveStages } from "@/lib/crm/workflow-utils";
import { CreateWorkflowFromTemplate } from "@/components/crm/create-workflow-from-template";

export const dynamic = "force-dynamic";

export default async function CrmWorkflowsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultCrmWorkflows(orgSlug);
  const wf = await listCrmWorkflows(orgSlug);
  const workflows = wf.ok ? wf.data.workflows : [];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Workflows"
        subtitle="Company-wide people processes — board and list views, linked to every member record."
        backHref={`/${orgSlug}/crm`}
        backLabel="CRM"
      />

      <div className="mb-8 pc-card p-4">
        <h2 className="pc-section-title">Add from anywhere</h2>
        <p className="pc-section-lead mt-1">
          Add members to workflows from their profile, web capture (
          <code className="text-xs">/api/crm/capture</code>
          ), or imports. Browser extension-ready — same member record powers your 360° view.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Your workflows</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((w) => {
            const stages = resolveStages(w.stages, w.steps);
            return (
              <Link
                key={w.id}
                href={`/${orgSlug}/crm/workflows/${w.id}`}
                className="pc-glass-panel block rounded-xl p-5 transition hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">
                  {w.department || "General"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-900">{w.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{w.description}</p>
                <p className="mt-3 text-xs text-zinc-400">
                  {stages.length} stages · {w._count.runs} active cards
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-[var(--pc-brand)]">
                  Open board →
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pc-card p-4">
        <h2 className="pc-section-title">Template library</h2>
        <p className="pc-section-lead mt-1 mb-4">
          Pre-built stages for membership, HR, fundraising, finance, and more. Duplicate to customize.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOW_TEMPLATES.map((t) => (
            <div
              key={t.templateKey}
              className="rounded-lg border border-[var(--pc-border)] p-3"
            >
              <p className="font-medium text-zinc-900">{t.name}</p>
              <p className="text-xs text-zinc-500">{t.department}</p>
              <p className="mt-1 text-sm text-zinc-600">{t.description}</p>
              <CreateWorkflowFromTemplate orgSlug={orgSlug} templateKey={t.templateKey} />
            </div>
          ))}
        </div>
      </div>
    </AdminPage>
  );
}
