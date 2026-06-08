/**
 * ProductAgent — generates/refines backlog tasks from architecture review.
 */
import type {
  ArchitectureReviewResult,
  ProductTasksResult,
} from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentResearch, AgentTask } from "@/quake-os/core/types";
import type { ResearchDiscovery } from "@/quake-os/research/discoveries";
import type { ProductRequirementsResult } from "@/quake-os/core/discovery-types";
import { sendMessage } from "@/quake-os/core/communication";
import { createTask, listTasks, pickTopTasks, updateTaskStatus } from "@/quake-os/core/task-engine";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";

export const ProductAgent = {
  id: "product-agent" as const,

  generateTasks(architectureReview: ArchitectureReviewResult): ProductTasksResult {
    const tasks: AgentTask[] = [];

    if (!architectureReview.approved) {
      sendMessage({
        from: ProductAgent.id,
        to: "cto-agent",
        subject: "Task generation blocked",
        body: "Architecture review did not approve. Escalating.",
      });
      return {
        agentId: ProductAgent.id,
        taskIds: [],
        tasks: [],
        completedAt: new Date().toISOString(),
      };
    }

    const existing = pickTopTasks(3, true);
    tasks.push(...existing);

    for (const rec of architectureReview.recommendations.slice(0, 2)) {
      const dup = listTasks().find((t) => t.title === rec && t.status !== "done");
      if (dup) continue;
      const task = createTask({
        id: generateId("task"),
        title: rec.slice(0, 120),
        description: `Auto-generated from architecture review: ${rec}`,
        priority: "P2",
        businessImpact: "medium",
        technicalComplexity: "medium",
        dependencies: [],
        ownerAgent: "developer-agent",
        researchSources: architectureReview.researchIds,
        acceptanceCriteria: ["Implemented", "Tests pass", "Audit approved"],
        tags: ["daily-cycle", "product-generated"],
      });
      tasks.push(task);
    }

    for (const t of tasks) {
      if (t.status === "pending") updateTaskStatus(t.id, "in_progress");
    }

    sendMessage({
      from: ProductAgent.id,
      to: "developer-agent",
      subject: "Daily tasks ready for build",
      body: `${tasks.length} tasks queued.`,
      refs: tasks.map((t) => t.id),
    });

    return {
      agentId: ProductAgent.id,
      taskIds: tasks.map((t) => t.id),
      tasks,
      completedAt: new Date().toISOString(),
    };
  },

  writeRequirements(
    task: AgentTask,
    finding: AgentResearch,
    discovery: ResearchDiscovery,
  ): ProductRequirementsResult {
    const userStories = [
      `As association PAC staff, I need to track hospital PAC contributions so I can report YTD progress to the board.`,
      `As a compliance officer, I need PAC data labeled illustrative vs live per PRODUCT-CLAIMS so we do not over-promise.`,
      `As a hospital member, I need my organization's PAC activity visible only within my tenant.`,
    ];

    const acceptanceCriteria =
      task.acceptanceCriteria.length > 0
        ? task.acceptanceCriteria
        : discovery.suggestedAcceptanceCriteria;

    const technicalNotes = [
      "Use getOrgDb(orgId) for all PAC queries",
      "requireCapability on exports and mutations",
      "Store requirements in knowledge/requirements.db",
      `Research source: ${finding.id}`,
      ...finding.sources.map((s) => `Source: ${s}`),
    ];

    const requirementId = generateId("req");
    memoryWrite(
      "requirements",
      {
        id: requirementId,
        taskId: task.id,
        title: task.title,
        insight: discovery.insight,
        userStories,
        acceptanceCriteria,
        technicalNotes,
        findingId: finding.id,
        writtenBy: ProductAgent.id,
        createdAt: new Date().toISOString(),
      },
      { title: task.title, agentId: ProductAgent.id, tags: ["requirements", "discovery"] },
    );

    sendMessage({
      from: ProductAgent.id,
      to: "developer-agent",
      subject: `Requirements ready: ${task.title}`,
      body: `${userStories.length} user stories | ${acceptanceCriteria.length} acceptance criteria`,
      refs: [task.id, requirementId],
    });

    return {
      agentId: ProductAgent.id,
      taskId: task.id,
      requirementId,
      userStories,
      acceptanceCriteria,
      technicalNotes,
      completedAt: new Date().toISOString(),
    };
  },
};
