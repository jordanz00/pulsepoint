/**
 * CTOAgent — technical health and debt tracking.
 */
import { getKnowledgeStatus } from "@/quake-os/knowledge/store";
import { getGraph } from "@/quake-os/knowledge-graph/store";
import { listTasks } from "@/quake-os/core/task-engine";
import { recordDecision } from "@/quake-os/core/planning-engine";
import { sendMessage } from "@/quake-os/core/communication";
import type { AgentServiceResult } from "@/quake-os/agents/services/agent-service";
import { serviceResult, sharedMemory } from "@/quake-os/agents/services/agent-service";

export const CtoAgent = {
  id: "cto-agent" as const,

  healthCheck() {
    const mem = sharedMemory();
    const pending = listTasks({ status: ["pending", "in_progress"] }).length;
    const decision = recordDecision({
      title: "CTO daily health check",
      context: `${pending} open tasks; ${mem.summary.totalEntries} memory entries`,
      decision: "Continue modular monolith; SQLite knowledge + file memory",
      alternatives: ["External agent runtime", "Postgres-only memory"],
      decidedBy: CtoAgent.id,
    });

    sendMessage({
      from: CtoAgent.id,
      to: "architecture-agent",
      subject: "CTO health check complete",
      body: `Knowledge DBs: ${Object.keys(getKnowledgeStatus()).length}; Graph nodes: ${getGraph().nodes.length}`,
      refs: [decision.id],
    });

    return {
      knowledge: getKnowledgeStatus(),
      graphNodes: getGraph().nodes.length,
      openTasks: pending,
      decisionId: decision.id,
    };
  },

  execute(action: string): AgentServiceResult {
    const data = CtoAgent.healthCheck();
    return serviceResult(CtoAgent.id, action, data);
  },
};
