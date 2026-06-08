/**
 * HospitalAssociationAgent — advocacy and hospital roster domain SME.
 */
import { runFullResearchPipeline } from "@/quake-os/research/pipeline";
import { createTaskFromResearch } from "@/quake-os/core/task-engine";
import { sendMessage } from "@/quake-os/core/communication";
import type { AgentServiceResult } from "@/quake-os/agents/services/agent-service";
import { serviceResult } from "@/quake-os/agents/services/agent-service";

export const HospitalAssociationAgent = {
  id: "hospital-association-agent" as const,

  reviewAdvocacyGaps() {
    const pipeline = runFullResearchPipeline();
    const advocacy = pipeline.filter((r) => r.finding.category === "hospital_association" || r.finding.category === "advocacy");
    const taskIds: string[] = [];

    for (const item of advocacy.slice(0, 2)) {
      const task = createTaskFromResearch({
        title: `Advocacy: ${item.finding.topic.slice(0, 80)}`,
        description: item.finding.summary,
        priority: "P2",
        ownerAgent: "developer-agent",
        researchId: item.finding.id,
        acceptanceCriteria: item.finding.recommendations.slice(0, 3),
      });
      taskIds.push(task.id);
    }

    sendMessage({
      from: HospitalAssociationAgent.id,
      to: "product-agent",
      subject: "Hospital association advocacy review",
      body: `${advocacy.length} advocacy findings; ${taskIds.length} tasks created.`,
      refs: taskIds,
    });

    return { findings: advocacy.length, taskIds };
  },

  execute(action: string): AgentServiceResult {
    return serviceResult(
      HospitalAssociationAgent.id,
      action,
      HospitalAssociationAgent.reviewAdvocacyGaps(),
    );
  },
};
