/**
 * Quake OS — agent service contract.
 *
 * Each agent is an independent service with shared memory access via ServiceContext.
 */
import type { AgentId } from "@/quake-os/core/types";
import { getMemorySummary, memoryList, memorySearch } from "@/quake-os/core/memory-store";
import { getKnowledgeStatus } from "@/quake-os/knowledge/store";
import { sendMessage } from "@/quake-os/core/communication";

export type ServiceContext = {
  workflowId?: string;
  stepId?: string;
  payload: Record<string, unknown>;
};

export type AgentServiceResult = {
  agentId: AgentId;
  action: string;
  ok: boolean;
  data: unknown;
  completedAt: string;
};

export type AgentService = {
  readonly id: AgentId;
  execute(action: string, ctx: ServiceContext): AgentServiceResult;
};

export function createServiceContext(
  payload: Record<string, unknown> = {},
  meta?: { workflowId?: string; stepId?: string },
): ServiceContext {
  return { ...meta, payload };
}

/** Shared memory helpers available to every agent service. */
export function sharedMemory() {
  return {
    summary: getMemorySummary(),
    knowledge: getKnowledgeStatus(),
    tasks: memoryList("tasks"),
    research: memoryList("research"),
    audits: memoryList("audits"),
    search: memorySearch,
    notify: sendMessage,
  };
}

export function serviceResult(
  agentId: AgentId,
  action: string,
  data: unknown,
  ok = true,
): AgentServiceResult {
  return {
    agentId,
    action,
    ok,
    data,
    completedAt: new Date().toISOString(),
  };
}
