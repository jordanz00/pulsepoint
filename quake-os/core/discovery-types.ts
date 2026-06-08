import type { AgentResearch, AgentTask } from "@/quake-os/core/types";
import type { BuildReviewChainResult } from "@/quake-os/core/build-review-chain";

export type DiscoveryResult = {
  finding: AgentResearch;
  searchHitCount: number;
  ticket: AgentTask;
};

export type ProductRequirementsResult = {
  agentId: "product-agent";
  taskId: string;
  requirementId: string;
  userStories: string[];
  acceptanceCriteria: string[];
  technicalNotes: string[];
  completedAt: string;
};

export type DiscoveryPipelineResult = {
  id: string;
  discovery: DiscoveryResult;
  requirements: ProductRequirementsResult;
  buildReview: BuildReviewChainResult;
  approved: boolean;
  completedAt: string;
};
