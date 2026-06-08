import { BaseAgent } from "@/quake-os/agents/runtime/base";
import { runFullResearchPipeline } from "@/quake-os/research/pipeline";

export class ResearchAgentRuntime extends BaseAgent {
  readonly id = "research-agent";

  execute() {
    const results = runFullResearchPipeline();
    this.notify(
      "product-agent",
      "Research pipeline complete",
      `${results.length} topics researched; ${results.reduce((n, r) => n + r.taskIds.length, 0)} tasks created.`,
      results.map((r) => r.finding.id),
    );
    return results;
  }
}

export const ResearchAgent = new ResearchAgentRuntime();
