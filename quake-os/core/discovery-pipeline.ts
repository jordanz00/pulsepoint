/**
 * Quake OS Discovery Pipeline
 *
 * Research discovers insight → creates ticket → Product writes requirements
 * → Developer builds → QA tests → Auditor reviews
 */
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { ResearchAgent } from "@/quake-os/agents/services/research-agent";
import { ProductAgent } from "@/quake-os/agents/services/product-agent";
import { runBuildReviewChain } from "@/quake-os/core/build-review-chain";
import type { DiscoveryPipelineResult } from "@/quake-os/core/discovery-types";
import {
  PAC_MANAGEMENT_DISCOVERY,
  type ResearchDiscovery,
} from "@/quake-os/research/discoveries";
import { startExecution, completeExecution } from "@/quake-os/orchestrator/execution-tracker";

export type { DiscoveryResult, ProductRequirementsResult, DiscoveryPipelineResult } from "@/quake-os/core/discovery-types";

export function runDiscoveryPipeline(
  discovery: ResearchDiscovery = PAC_MANAGEMENT_DISCOVERY,
): DiscoveryPipelineResult | null {
  const execution = startExecution({
    workflowId: "discovery-to-ship",
    agentIds: [
      "research-agent",
      "product-agent",
      "developer-agent",
      "qa-agent",
      "auditor-agent",
    ],
  });

  // 1. Research Agent discovers + creates ticket
  const discoveryResult = ResearchAgent.discover(discovery);

  // 2. Product Agent writes requirements
  const requirements = ProductAgent.writeRequirements(
    discoveryResult.ticket,
    discoveryResult.finding,
    discovery,
  );

  // 3–5. Developer builds → QA tests → Auditor reviews
  const buildReview = runBuildReviewChain(discoveryResult.ticket.id);
  if (!buildReview) {
    completeExecution(execution.id, "failed", "Build review chain failed");
    return null;
  }

  const result: DiscoveryPipelineResult = {
    id: generateId("disc"),
    discovery: discoveryResult,
    requirements,
    buildReview,
    approved: buildReview.approved,
    completedAt: new Date().toISOString(),
  };

  memoryWrite("lessons", result, {
    title: `Discovery pipeline: ${discovery.insight}`,
    tags: ["discovery-pipeline", buildReview.approved ? "approved" : "revise"],
  });

  completeExecution(execution.id, "completed");

  sendMessage({
    from: "research-agent",
    to: "product-agent",
    subject: `Discovery shipped: ${discovery.insight}`,
    body: `Ticket ${discoveryResult.ticket.id} | Auditor: ${buildReview.auditorReview.verdict}`,
    refs: [discoveryResult.ticket.id, discoveryResult.finding.id],
  });

  return result;
}

export function createTicketFromDiscovery(discovery: ResearchDiscovery) {
  return ResearchAgent.discover(discovery);
}
