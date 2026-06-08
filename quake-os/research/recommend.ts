/**
 * Research Step 5 — Create recommendations and backlog tasks from findings.
 */
import type {
  AnalysisSignal,
  ResearchRecommendation,
  StoredFinding,
} from "@/quake-os/research/types";
import { publishRecommendation } from "@/quake-os/core/communication";
import { generateId } from "@/quake-os/core/memory-store";
import { createTaskFromResearch } from "@/quake-os/core/task-engine";

function priorityForSignal(type: AnalysisSignal["type"]): "P0" | "P1" | "P2" | "P3" {
  if (type === "risk") return "P1";
  if (type === "gap") return "P1";
  if (type === "opportunity") return "P2";
  return "P3";
}

function ownerForSignal(type: AnalysisSignal["type"]): string {
  if (type === "risk") return "security-agent";
  if (type === "gap") return "developer-agent";
  if (type === "opportunity") return "product-agent";
  return "research-agent";
}

export function createRecommendations(finding: StoredFinding): {
  recommendations: ResearchRecommendation[];
  taskIds: string[];
} {
  const recommendations: ResearchRecommendation[] = [];
  const taskIds: string[] = [];

  for (const signal of finding.signals) {
    const title = `${signal.type}: ${finding.topic}`.slice(0, 120);
    const rationale = signal.evidence.join(" | ").slice(0, 500);
    const priority = priorityForSignal(signal.type);
    const ownerAgent = ownerForSignal(signal.type);

    const rec: ResearchRecommendation = {
      id: generateId("rrec"),
      title,
      rationale,
      priority,
      ownerAgent,
      linkedResearchId: finding.id,
    };
    recommendations.push(rec);

    publishRecommendation({
      title: rec.title,
      rationale: rec.rationale,
      proposedBy: finding.authorAgent,
      targetAgents: [ownerAgent, "product-agent"],
      linkedTaskIds: [],
      priority,
    });

    const task = createTaskFromResearch({
      title: rec.title,
      description: rec.rationale,
      priority,
      ownerAgent,
      researchId: finding.id,
      acceptanceCriteria: [
        "Finding addressed in code or docs",
        "pnpm quake:gates passes",
        "Task completion audit approved",
      ],
    });
    taskIds.push(task.id);
  }

  return { recommendations, taskIds };
}
