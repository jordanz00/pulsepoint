/**
 * Quake OS — daily cycle pipeline types (Research → Arch → Product → Dev → QA → Audit).
 */
import type { AgentAudit, AgentResearch, AgentTask } from "@/quake-os/core/types";

export type ResearchCycleResult = {
  agentId: "research-agent";
  research: AgentResearch[];
  tasksCreated: string[];
  recommendations: string[];
  completedAt: string;
};

export type ArchitectureReviewResult = {
  agentId: "architecture-agent";
  researchIds: string[];
  findings: { module: string; level: "pass" | "warn" | "fail"; note: string }[];
  recommendations: string[];
  approved: boolean;
  completedAt: string;
};

export type ProductTasksResult = {
  agentId: "product-agent";
  taskIds: string[];
  tasks: AgentTask[];
  completedAt: string;
};

export type DeveloperBuildResult = {
  agentId: "developer-agent" | "backend-engineer-agent" | "frontend-engineer-agent";
  taskIds: string[];
  buildPlans: { taskId: string; summary: string; ownerAgent: string }[];
  status: "dispatched";
  completedAt: string;
};

export type QATestResult = {
  agentId: "qa-agent";
  taskIds: string[];
  checklist: { item: string; status: "pass" | "pending" | "warn" }[];
  gateCommand: string;
  completedAt: string;
};

import type { BacklogRefreshResult } from "@/quake-os/core/backlog-engine";

export type DailyCycleResult = {
  id: string;
  startedAt: string;
  completedAt: string;
  backlog?: BacklogRefreshResult;
  research: ResearchCycleResult;
  architecture: ArchitectureReviewResult;
  product: ProductTasksResult;
  developer: DeveloperBuildResult;
  qa: QATestResult;
  audit: AgentAudit;
};
