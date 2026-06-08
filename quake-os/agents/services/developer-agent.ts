/**
 * DeveloperAgent — dispatches implementation plans for Cursor/human execution.
 */
import type {
  DeveloperBuildResult,
  ProductTasksResult,
} from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentTask } from "@/quake-os/core/types";
import type { FeatureBuildResult } from "@/quake-os/core/feature-review-chain";
import { sendMessage } from "@/quake-os/core/communication";
import { memoryWrite, generateId } from "@/quake-os/core/memory-store";
import { pickTopTasks } from "@/quake-os/core/task-engine";

export const DeveloperAgent = {
  id: "developer-agent" as const,

  build(tasks: ProductTasksResult): DeveloperBuildResult {
    const taskList =
      tasks.tasks ??
      (tasks.taskIds?.length ? pickTopTasks(tasks.taskIds.length) : pickTopTasks(2));
    const buildPlans = taskList.map((t) => {
      const owner = t.ownerAgent || DeveloperAgent.id;
      const summary = `Implement: ${t.title}. AC: ${t.acceptanceCriteria.join("; ") || "TBD"}`;
      memoryWrite(
        "requirements",
        {
          id: generateId("req"),
          taskId: t.id,
          title: t.title,
          summary,
          ownerAgent: owner,
          createdAt: new Date().toISOString(),
        },
        { title: t.title, agentId: owner, tags: ["build-plan", "daily-cycle"] },
      );
      return { taskId: t.id, summary, ownerAgent: owner };
    });

    sendMessage({
      from: DeveloperAgent.id,
      to: "qa-agent",
      subject: "Build plans dispatched",
      body: `${buildPlans.length} implementation plans written to memory/requirements.`,
      refs: tasks.taskIds,
    });

    return {
      agentId: DeveloperAgent.id,
      taskIds: tasks.taskIds,
      buildPlans,
      status: "dispatched",
      completedAt: new Date().toISOString(),
    };
  },

  buildFeature(task: AgentTask): FeatureBuildResult {
    const summary = `Implement: ${task.title}. AC: ${task.acceptanceCriteria.join("; ") || "TBD"}`;
    const buildPlan = { taskId: task.id, summary, ownerAgent: DeveloperAgent.id };

    memoryWrite(
      "requirements",
      {
        id: generateId("req"),
        taskId: task.id,
        title: task.title,
        summary,
        ownerAgent: DeveloperAgent.id,
        createdAt: new Date().toISOString(),
      },
      { title: task.title, agentId: DeveloperAgent.id, tags: ["build-plan", "feature-review"] },
    );

    sendMessage({
      from: DeveloperAgent.id,
      to: "qa-agent",
      subject: `Feature built: ${task.title}`,
      body: summary,
      refs: [task.id],
    });

    return {
      agentId: DeveloperAgent.id,
      taskId: task.id,
      title: task.title,
      buildPlan,
      status: "dispatched",
      completedAt: new Date().toISOString(),
    };
  },
};
