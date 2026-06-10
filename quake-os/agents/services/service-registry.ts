/**
 * Quake OS — agent service registry.
 *
 * Dispatches workflow steps to independent agent services with shared memory.
 */
import type { AgentId } from "@/quake-os/core/types";
import { resolveAgentId } from "@/quake-os/core/agent-registry";
import type { ServiceContext, AgentServiceResult } from "@/quake-os/agents/services/agent-service";
import { ResearchAgent } from "@/quake-os/agents/services/research-agent";
import { ArchitectureAgent } from "@/quake-os/agents/services/architecture-agent";
import { ProductAgent } from "@/quake-os/agents/services/product-agent";
import { DeveloperAgent } from "@/quake-os/agents/services/developer-agent";
import { QAAgent } from "@/quake-os/agents/services/qa-agent";
import { AuditorAgent } from "@/quake-os/agents/services/auditor-agent";
import { HealthcareSmeAgent } from "@/quake-os/agents/services/healthcare-sme-agent";
import { CtoAgent } from "@/quake-os/agents/services/cto-agent";
import { ComplianceAgent } from "@/quake-os/agents/services/compliance-agent";
import { DocumentationAgent } from "@/quake-os/agents/services/documentation-agent";
import { HospitalAssociationAgent } from "@/quake-os/agents/services/hospital-association-agent";
import { pickTopTasks } from "@/quake-os/core/task-engine";
import type {
  ArchitectureReviewResult,
  DeveloperBuildResult,
  ProductTasksResult,
  QATestResult,
  ResearchCycleResult,
} from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentAudit } from "@/quake-os/core/types";
import { serviceResult } from "@/quake-os/agents/services/agent-service";

export type WorkflowPayload = Record<string, unknown>;

function parseMethod(action: string): string {
  const dot = action.match(/\.(\w+)\(\)/);
  if (dot?.[1]) return dot[1];
  const verb = action.match(/^(\w+)/);
  return verb?.[1]?.toLowerCase() ?? "default";
}

type ServiceExecutor = {
  id: AgentId;
  execute(action: string, ctx: ServiceContext): AgentServiceResult;
};

const SERVICES: ServiceExecutor[] = [
  {
    id: "research-agent",
    execute(action, ctx) {
      const method = parseMethod(action);
      if (method === "discover") {
        const data = ctx.payload.discovery;
        return serviceResult("research-agent", action, ResearchAgent.discover(data as never));
      }
      const data = ResearchAgent.run();
      return serviceResult("research-agent", action, data);
    },
  },
  {
    id: "architecture-agent",
    execute(action, ctx) {
      const research = ctx.payload.research as ResearchCycleResult;
      const data = ArchitectureAgent.review(research);
      return serviceResult("architecture-agent", action, data);
    },
  },
  {
    id: "product-agent",
    execute(action, ctx) {
      const method = parseMethod(action);
      if (method === "generateTasks" || method === "triage" || method === "pick") {
        const arch = ctx.payload.architecture as ArchitectureReviewResult;
        if (arch) {
          return serviceResult("product-agent", action, ProductAgent.generateTasks(arch));
        }
        const top = pickTopTasks(3);
        const data: ProductTasksResult = {
          agentId: ProductAgent.id,
          taskIds: top.map((t) => t.id),
          tasks: top,
          completedAt: new Date().toISOString(),
        };
        return serviceResult("product-agent", action, data);
      }
      const top = pickTopTasks(3);
      const data: ProductTasksResult = {
        agentId: ProductAgent.id,
        taskIds: top.map((t) => t.id),
        tasks: top,
        completedAt: new Date().toISOString(),
      };
      return serviceResult("product-agent", action, data);
    },
  },
  {
    id: "developer-agent",
    execute(action, ctx) {
      const product = ctx.payload.product as ProductTasksResult | undefined;
      const tasks = ctx.payload.tasks as ProductTasksResult | undefined;
      const input = product ?? tasks;
      if (input?.taskIds) {
        return serviceResult("developer-agent", action, DeveloperAgent.build(input));
      }
      const top = pickTopTasks(2);
      const synthetic: ProductTasksResult = {
        agentId: "product-agent",
        taskIds: top.map((t) => t.id),
        tasks: top,
        completedAt: new Date().toISOString(),
      };
      return serviceResult("developer-agent", action, DeveloperAgent.build(synthetic));
    },
  },
  {
    id: "qa-agent",
    execute(action, ctx) {
      const dev = ctx.payload.developer as DeveloperBuildResult;
      const runGates = ctx.payload.runGates === true;
      const gatesResult = ctx.payload.gatesResult as { passed: boolean } | undefined;
      if (!dev?.taskIds) {
        return serviceResult("qa-agent", action, {
          agentId: "qa-agent",
          taskIds: [],
          checklist: [{ item: "No developer build in context", status: "warn" }],
          gateCommand: "pnpm quake:gates",
          completedAt: new Date().toISOString(),
        });
      }
      const data = QAAgent.test(dev, { runGates, gatesResult });
      return serviceResult("qa-agent", action, data);
    },
  },
  {
    id: "auditor-agent",
    execute(action, ctx) {
      const qa = ctx.payload.qa as QATestResult;
      const data = AuditorAgent.audit(qa);
      return serviceResult("auditor-agent", action, data);
    },
  },
  {
    id: "ceo-agent",
    execute(action) {
      const tasks = pickTopTasks(5);
      return serviceResult("ceo-agent", action, {
        directive: "Prioritize top backlog",
        taskIds: tasks.map((t) => t.id),
      });
    },
  },
  { id: "cto-agent", execute: (a) => CtoAgent.execute(a) },
  { id: "compliance-agent", execute: (a) => ComplianceAgent.execute(a) },
  { id: "documentation-agent", execute: (a) => DocumentationAgent.execute(a) },
  {
    id: "healthcare-sme-agent",
    execute(action, ctx) {
      const task = ctx.payload.task as import("@/quake-os/core/types").AgentTask | undefined;
      if (!task) {
        return serviceResult("healthcare-sme-agent", action, { note: "No task in context" });
      }
      return serviceResult(
        "healthcare-sme-agent",
        action,
        HealthcareSmeAgent.critiqueFeature(task, []),
      );
    },
  },
  { id: "hospital-association-agent", execute: (a) => HospitalAssociationAgent.execute(a) },
];

const SERVICE_MAP = new Map(SERVICES.map((s) => [s.id, s]));

export function listServiceAgents(): AgentId[] {
  return [...SERVICE_MAP.keys()];
}

export function executeServiceAction(
  agentId: AgentId,
  action: string,
  payload: WorkflowPayload = {},
  meta?: { workflowId?: string; stepId?: string },
): AgentServiceResult {
  const resolved = resolveAgentId(agentId);
  const service = SERVICE_MAP.get(resolved);
  if (!service) {
    return serviceResult(resolved, action, { error: `No service for ${resolved}` }, false);
  }
  return service.execute(action, { payload, ...meta });
}
