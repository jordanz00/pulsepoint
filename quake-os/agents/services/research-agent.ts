/**
 * ResearchAgent — continuous market & association research.
 */
import type { ResearchCycleResult } from "@/quake-os/orchestrator/daily-cycle-types";
import type { AgentResearch, AgentTask } from "@/quake-os/core/types";
import type { ResearchDiscovery } from "@/quake-os/research/discoveries";
import { sendMessage } from "@/quake-os/core/communication";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { createTask, listTasks } from "@/quake-os/core/task-engine";
import { runFullResearchPipeline } from "@/quake-os/research/pipeline";
import { searchSources } from "@/quake-os/research/search";
import { analyzeSearchResults } from "@/quake-os/research/analyze";
import { summarizeAnalysis } from "@/quake-os/research/summarize";

import type { DiscoveryResult } from "@/quake-os/core/discovery-types";

export const ResearchAgent = {
  id: "research-agent" as const,

  discover(discovery: ResearchDiscovery): DiscoveryResult {
    const search = searchSources({
      topic: discovery.insight,
      category: discovery.category,
      keywords: discovery.keywords,
      sourcePaths: discovery.sources,
      authorAgent: ResearchAgent.id,
    });
    const analysis = analyzeSearchResults(search);
    const summary = summarizeAnalysis(analysis, discovery.sources);

    const finding: AgentResearch = {
      id: generateId("res"),
      topic: discovery.insight,
      category: discovery.category,
      summary: summary.executiveSummary,
      sources: discovery.sources,
      recommendations: [
        `Create ticket: ${discovery.insight}`,
        ...summary.keyFindings.slice(0, 3),
      ],
      authorAgent: discovery.authorAgent,
      createdAt: new Date().toISOString(),
    };

    memoryWrite("research", finding, {
      title: discovery.insight,
      agentId: ResearchAgent.id,
      tags: [discovery.category, "discovery"],
    });

    const existing = listTasks().find(
      (t) => t.title === discovery.insight && t.status !== "done" && t.status !== "cancelled",
    );

    const ticket =
      existing ??
      createTask({
        id: generateId("task"),
        title: discovery.insight,
        description: summary.executiveSummary,
        priority: discovery.priority,
        businessImpact: discovery.businessImpact,
        technicalComplexity: "medium",
        dependencies: [],
        ownerAgent: "developer-agent",
        researchSources: [finding.id],
        acceptanceCriteria: discovery.suggestedAcceptanceCriteria,
        tags: ["discovery", discovery.category],
      });

    sendMessage({
      from: ResearchAgent.id,
      to: "product-agent",
      subject: `Discovery: ${discovery.insight}`,
      body: `Ticket ${ticket.id} created. ${search.hits.length} source hits.`,
      refs: [finding.id, ticket.id],
    });

    return { finding, searchHitCount: search.hits.length, ticket };
  },

  run(): ResearchCycleResult {
    const pipeline = runFullResearchPipeline();
    sendMessage({
      from: ResearchAgent.id,
      to: "architecture-agent",
      subject: "Research pipeline complete",
      body: `Search→Analyze→Summarize→Store→Recommend: ${pipeline.length} findings; ${pipeline.reduce((n, p) => n + p.taskIds.length, 0)} tasks.`,
      refs: pipeline.map((p) => p.finding.id),
    });
    return {
      agentId: ResearchAgent.id,
      research: pipeline.map((p) => p.finding),
      tasksCreated: pipeline.flatMap((p) => p.taskIds),
      recommendations: pipeline.flatMap((p) => p.recommendations.map((r) => r.id)),
      completedAt: new Date().toISOString(),
    };
  },
};
