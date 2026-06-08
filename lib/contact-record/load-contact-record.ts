import { getOrgDb } from "@/lib/db";
import { loadMember360 } from "@/lib/member-360";
import { memberTagsArray } from "@/lib/member-tags";
import { suggestEnrichment } from "@/lib/crm/enrichment";
import { parseEnrichmentData } from "@/lib/crm/prospector-enrichment";
import { resolveStages, stageIdForStep } from "@/lib/crm/workflow-utils";
import type { ContactRecordData } from "@/lib/contact-record/types";

export async function loadContactRecord(
  orgId: string,
  orgSlug: string,
  memberId: string,
): Promise<ContactRecordData | null> {
  const db = getOrgDb(orgId);

  const member = await db.member.findFirst({ where: { id: memberId } });
  if (!member) return null;

  const [
    profile360,
    notes,
    deals,
    workflowRuns,
    relationships,
    sources,
    pipelines,
    workflows,
  ] = await Promise.all([
    loadMember360(orgId, memberId, orgSlug),
    db.memberNote.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { author: { select: { name: true, email: true } } },
    }),
    db.deal.findMany({
      where: { memberId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { pipeline: { select: { name: true } } },
    }),
    db.crmWorkflowRun.findMany({
      where: { memberId, status: "ACTIVE" },
      include: {
        workflow: { select: { id: true, name: true, stages: true, steps: true } },
      },
    }),
    db.memberRelationship.findMany({
      where: { OR: [{ fromMemberId: memberId }, { toMemberId: memberId }] },
      include: {
        fromMember: { select: { id: true, firstName: true, lastName: true } },
        toMember: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    db.contactSource.findMany({
      where: { memberId },
      orderBy: { capturedAt: "desc" },
      take: 15,
    }),
    db.dealPipeline.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    db.crmWorkflow.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, department: true },
    }),
  ]);

  return {
    member: {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      status: member.status,
      company: member.company,
      jobTitle: member.jobTitle,
      linkedInUrl: member.linkedInUrl,
      websiteUrl: member.websiteUrl,
      relationshipHealth: member.relationshipHealth,
      lastTouchAt: member.lastTouchAt,
      nextFollowUpAt: member.nextFollowUpAt,
      joinedAt: member.joinedAt,
      engagementScore: member.engagementScore,
      engagementTier: member.engagementTier,
    },
    tags: memberTagsArray(member.tags),
    profile360,
    notes: notes.map((n) => ({
      id: n.id,
      body: n.body,
      noteType: n.noteType,
      channel: n.channel,
      createdAt: n.createdAt,
      authorName: n.author?.name ?? n.author?.email ?? null,
      nextFollowUpAt: n.nextFollowUpAt,
    })),
    deals: deals.map((d) => ({
      id: d.id,
      title: d.title,
      stage: d.stage,
      amountCents: d.amountCents,
      pipelineName: d.pipeline.name,
      updatedAt: d.updatedAt,
    })),
    workflowRuns: workflowRuns.map((r) => {
      const stages = resolveStages(r.workflow.stages, r.workflow.steps);
      const sid = r.stageId || stageIdForStep(stages, r.currentStep);
      const stage = stages.find((s) => s.id === sid);
      return {
        id: r.id,
        workflowId: r.workflow.id,
        workflowName: r.workflow.name,
        stageLabel: stage?.label ?? "In progress",
      };
    }),
    relationships: relationships.map((rel) => {
      const isFrom = rel.fromMemberId === memberId;
      const other = isFrom ? rel.toMember : rel.fromMember;
      return {
        id: rel.id,
        label: `${other.firstName} ${other.lastName}`,
        relationType: rel.relationType,
        otherMemberId: other.id,
      };
    }),
    sources: sources.map((s) => ({
      id: s.id,
      sourceKind: s.sourceKind,
      label: s.label,
      capturedAt: s.capturedAt,
    })),
    firmographics: parseEnrichmentData(member.enrichmentData),
    enrichmentSuggestions: suggestEnrichment(member),
    pipelines,
    workflows,
  };
}
