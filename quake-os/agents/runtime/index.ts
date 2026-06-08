/**
 * Quake OS — agent runtime (delegates to service registry).
 */
export { BaseAgent } from "@/quake-os/agents/runtime/base";
export { ResearchAgent } from "@/quake-os/agents/runtime/research";

import { resolveAgentId } from "@/quake-os/core/agent-registry";
import { executeServiceAction, listServiceAgents } from "@/quake-os/agents/services/service-registry";
import { runFeatureReviewChain } from "@/quake-os/core/feature-review-chain";

type AgentRunner = { id: string; execute: (input?: Record<string, unknown>) => unknown };

function serviceRunner(id: string): AgentRunner {
  return {
    id,
    execute(input) {
      const action = typeof input?.action === "string" ? input.action : "execute";
      return executeServiceAction(id, action, input ?? {});
    },
  };
}

const CANONICAL_AGENTS = listServiceAgents();

export const AGENT_RUNTIMES: Record<string, AgentRunner> = Object.fromEntries(
  CANONICAL_AGENTS.map((id) => [id, serviceRunner(id)]),
);

// Alias agents resolve through registry at dispatch time
for (const alias of [
  "backend-engineer-agent",
  "frontend-engineer-agent",
  "database-agent",
  "security-agent",
  "healthcare-association-agent",
  "health-system-agent",
  "nonprofit-agent",
]) {
  AGENT_RUNTIMES[alias] = {
    id: alias,
    execute(input) {
      const resolved = resolveAgentId(alias);
      const action = typeof input?.action === "string" ? input.action : "execute";
      return executeServiceAction(resolved, action, input ?? {});
    },
  };
}

export function runAgent(id: string, input?: Record<string, unknown>): unknown {
  const resolved = resolveAgentId(id);
  const runner = AGENT_RUNTIMES[id] ?? AGENT_RUNTIMES[resolved] ?? serviceRunner(resolved);
  return runner.execute(input);
}

export function completeTask(taskId: string) {
  return runFeatureReviewChain(taskId);
}
