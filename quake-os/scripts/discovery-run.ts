#!/usr/bin/env tsx
import { bootstrapOs } from "@/quake-os/orchestrator/index";
import { runDiscoveryPipeline } from "@/quake-os/core/discovery-pipeline";
import { PAC_MANAGEMENT_DISCOVERY } from "@/quake-os/research/discoveries";

bootstrapOs();

const insight = process.argv[2];
const discovery = insight
  ? { ...PAC_MANAGEMENT_DISCOVERY, insight }
  : PAC_MANAGEMENT_DISCOVERY;

const result = runDiscoveryPipeline(discovery);
if (!result) {
  console.error("Discovery pipeline failed");
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      insight: discovery.insight,
      ticketId: result.discovery.ticket.id,
      requirementId: result.requirements.requirementId,
      searchHits: result.discovery.searchHitCount,
      auditorVerdict: result.buildReview.auditorReview.verdict,
      approved: result.approved,
      userStories: result.requirements.userStories.length,
      acceptanceCriteria: result.requirements.acceptanceCriteria.length,
    },
    null,
    2,
  ),
);
