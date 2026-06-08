import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ensureDefaultCrmWorkflows } from "@/app/actions/crm";
import { getWorkflowBoard } from "@/app/actions/crm-workflows";
import { WorkflowKanbanBoard } from "@/components/crm/workflow-kanban-board";
import { WorkflowListView } from "@/components/crm/workflow-list-view";
import { WorkflowViewToggle } from "@/components/crm/workflow-view-toggle";

export const dynamic = "force-dynamic";

export default async function WorkflowBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; workflowId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { orgSlug, workflowId } = await params;
  const { view } = await searchParams;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultCrmWorkflows(orgSlug);
  const board = await getWorkflowBoard(orgSlug, workflowId);
  if (!board.ok) notFound();

  const { workflow, stages, fields, columns } = board.data;
  const listRows = columns.flatMap((c) =>
    c.runs.map((r) => ({ ...r, stageId: r.stageId || c.stage.id })),
  );
  const isList = view === "list";

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={workflow.name}
        subtitle={
          workflow.description ||
          `${workflow.department || "General"} · ${board.data.allRuns} active cards`
        }
        backHref={`/${orgSlug}/crm/workflows`}
        backLabel="Workflows"
        actions={
          <Suspense fallback={null}>
            <WorkflowViewToggle orgSlug={orgSlug} workflowId={workflowId} />
          </Suspense>
        }
      />

      {isList ? (
        <WorkflowListView
          orgSlug={orgSlug}
          workflowId={workflowId}
          stages={stages}
          fields={fields}
          rows={listRows}
        />
      ) : (
        <WorkflowKanbanBoard
          orgSlug={orgSlug}
          workflowId={workflowId}
          fromTemplate={workflow.fromTemplate}
          columns={columns}
          fields={fields}
        />
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        Drag cards between stages on the board, or switch to list view for inline editing. Each card
        links to the member&apos;s full CRM profile.
      </p>
    </AdminPage>
  );
}
