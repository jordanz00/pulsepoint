/**
 * Quake OS — planning engine for roadmap and phase-2 waves.
 */
import type { AgentDecision, AgentId } from "@/quake-os/core/types";
import { generateId, memoryList, memoryWrite } from "@/quake-os/core/memory-store";
import { pickTopTasks, updateTaskStatus } from "@/quake-os/core/task-engine";

export type SprintPlan = {
  id: string;
  name: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  initiative: string;
  taskIds: string[];
  agents: AgentId[];
  acceptanceCriteria: string[];
  createdAt: string;
};

export function recordDecision(input: Omit<AgentDecision, "id" | "createdAt" | "status">): AgentDecision {
  const decision: AgentDecision = {
    id: generateId("dec"),
    status: "accepted",
    createdAt: new Date().toISOString(),
    ...input,
  };
  memoryWrite("decisions", decision, { title: decision.title, agentId: decision.decidedBy });
  return decision;
}

export function createSprintPlan(input: {
  name: string;
  phase: SprintPlan["phase"];
  initiative: string;
  taskCount?: number;
  agents: AgentId[];
  acceptanceCriteria: string[];
}): SprintPlan {
  const tasks = pickTopTasks(input.taskCount ?? 3);
  const plan: SprintPlan = {
    id: generateId("sprint"),
    name: input.name,
    phase: input.phase,
    initiative: input.initiative,
    taskIds: tasks.map((t) => t.id),
    agents: input.agents,
    acceptanceCriteria: input.acceptanceCriteria,
    createdAt: new Date().toISOString(),
  };
  memoryWrite("roadmaps", plan, { title: input.name, tags: ["sprint", `phase-${input.phase}`] });
  for (const task of tasks) {
    updateTaskStatus(task.id, "in_progress");
  }
  return plan;
}

export function listDecisions(): AgentDecision[] {
  return memoryList<AgentDecision>("decisions").sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function listSprintPlans(): SprintPlan[] {
  return memoryList<SprintPlan>("roadmaps");
}
