#!/usr/bin/env tsx
import { bootstrapOs } from "@/quake-os/orchestrator/index";
import {
  runFeatureReviewChain,
  summarizeReviewChain,
} from "@/quake-os/core/feature-review-chain";

const taskId = process.argv[2];
if (!taskId) {
  console.error("Usage: pnpm quake:feature:review <task-id>");
  process.exit(1);
}

bootstrapOs();
const result = runFeatureReviewChain(taskId);
if (!result) {
  console.error(`Task not found: ${taskId}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      taskId: result.taskId,
      approved: result.approved,
      ceoVerdict: result.ceoApproval.verdict,
      summary: summarizeReviewChain(result),
    },
    null,
    2,
  ),
);
