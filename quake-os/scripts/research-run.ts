#!/usr/bin/env tsx
import { bootstrapOs } from "@/quake-os/orchestrator/index";
import { runFullResearchPipeline } from "@/quake-os/research/pipeline";

bootstrapOs();
const results = runFullResearchPipeline();
console.log(
  JSON.stringify(
    {
      findings: results.length,
      tasks: results.reduce((n, r) => n + r.taskIds.length, 0),
      topics: results.map((r) => ({
        topic: r.finding.topic,
        hits: r.search.hits.length,
        signals: r.analysis.signals.length,
        tasks: r.taskIds.length,
      })),
    },
    null,
    2,
  ),
);
