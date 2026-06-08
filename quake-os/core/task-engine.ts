/**
 * Quake OS — autonomous task generation and backlog management.
 */
import type { AgentId, AgentTask, TaskPriority, TaskStatus } from "@/quake-os/core/types";
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryList, memoryRead, memoryWrite } from "@/quake-os/core/memory-store";

const PRIORITY_ORDER: Record<TaskPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

export function createTask(
  input: Omit<AgentTask, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string;
    status?: TaskStatus;
  },
): AgentTask {
  const now = new Date().toISOString();
  const { id: inputId, status: inputStatus, ...rest } = input;
  const task: AgentTask = {
    ...rest,
    id: inputId ?? generateId("task"),
    status: inputStatus ?? "pending",
    createdAt: now,
    updatedAt: now,
  };
  memoryWrite("tasks", task, { title: task.title, agentId: task.ownerAgent, tags: task.tags });
  sendMessage({
    from: "orchestrator",
    to: task.ownerAgent,
    subject: `New task: ${task.title}`,
    body: task.description,
    refs: [task.id],
  });
  return task;
}

export function updateTaskStatus(id: string, status: TaskStatus): AgentTask | null {
  const task = memoryRead<AgentTask>("tasks", id);
  if (!task) return null;
  const updated: AgentTask = {
    ...task,
    status,
    updatedAt: new Date().toISOString(),
    completedAt: status === "done" ? new Date().toISOString() : task.completedAt,
  };
  memoryWrite("tasks", updated, { title: updated.title, agentId: updated.ownerAgent });
  return updated;
}

export function assignTask(id: string, ownerAgent: AgentId): AgentTask | null {
  const task = memoryRead<AgentTask>("tasks", id);
  if (!task) return null;
  const updated: AgentTask = { ...task, ownerAgent, updatedAt: new Date().toISOString() };
  memoryWrite("tasks", updated, { title: updated.title, agentId: ownerAgent });
  sendMessage({
    from: "orchestrator",
    to: ownerAgent,
    subject: `Task assigned: ${task.title}`,
    body: task.description,
    refs: [id],
  });
  return updated;
}

export function listTasks(filter?: {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority;
  ownerAgent?: AgentId;
}): AgentTask[] {
  let tasks = memoryList<AgentTask>("tasks");
  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    tasks = tasks.filter((t) => statuses.includes(t.status));
  }
  if (filter?.priority) tasks = tasks.filter((t) => t.priority === filter.priority);
  if (filter?.ownerAgent) tasks = tasks.filter((t) => t.ownerAgent === filter.ownerAgent);
  return tasks.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function pickTopTasks(count: number, excludeHuman = true): AgentTask[] {
  const pending = listTasks({ status: ["pending", "in_progress"] });
  const filtered = excludeHuman ? pending.filter((t) => !t.human) : pending;
  return filtered.slice(0, count);
}

export function createTaskFromResearch(input: {
  title: string;
  description: string;
  priority: TaskPriority;
  ownerAgent: AgentId;
  researchId: string;
  acceptanceCriteria: string[];
}): AgentTask {
  const existing = memoryList<AgentTask>("tasks").find(
    (t) => t.title === input.title && t.status !== "done" && t.status !== "cancelled",
  );
  if (existing) return existing;
  return createTask({
    title: input.title,
    description: input.description,
    priority: input.priority,
    businessImpact: input.priority === "P0" ? "critical" : "high",
    technicalComplexity: "medium",
    dependencies: [],
    ownerAgent: input.ownerAgent,
    researchSources: [input.researchId],
    acceptanceCriteria: input.acceptanceCriteria,
    tags: ["auto-from-research"],
  });
}
