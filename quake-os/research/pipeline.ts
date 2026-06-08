/**
 * Quake OS Research Pipeline — Search → Analyze → Summarize → Store → Recommend
 */
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { knowledgeWrite } from "@/quake-os/knowledge/store";
import { analyzeSearchResults } from "@/quake-os/research/analyze";
import { createRecommendations } from "@/quake-os/research/recommend";
import { searchSources } from "@/quake-os/research/search";
import { summarizeAnalysis } from "@/quake-os/research/summarize";
import type { ResearchPipelineResult, ResearchQuery } from "@/quake-os/research/types";
import type { StoredFinding } from "@/quake-os/research/types";

export const RESEARCH_QUERIES: ResearchQuery[] = [
  {
    topic: "AMS competitor landscape",
    category: "competitor",
    keywords: ["Fonteva", "iMIS", "Protech", "competitor", "wedge"],
    sourcePaths: [
      "data/quake-os/competitive-intel.json",
      "docs/PROTECH-FEATURE-MAP.md",
      "docs/PRODUCT-CLAIMS.md",
    ],
    authorAgent: "research-agent",
  },
  {
    topic: "Hospital association advocacy",
    category: "hospital_association",
    keywords: ["advocacy", "take-action", "hospital", "campaign", "legislative"],
    sourcePaths: [
      "lib/advocacy-dashboard.ts",
      "app/actions/advocacy.ts",
      "docs/PRODUCT-CLAIMS.md",
    ],
    authorAgent: "hospital-association-agent",
  },
  {
    topic: "Membership scale and security",
    category: "membership",
    keywords: ["tenant", "getOrgDb", "clampTake", "member", "leak"],
    sourcePaths: [
      "lib/query-limits.ts",
      "docs/SCALE-AND-SECURITY.md",
      "scripts/ten-member-leak-checks.sh",
    ],
    authorAgent: "security-agent",
  },
  {
    topic: "Healthcare CE and education",
    category: "healthcare_association",
    keywords: ["CE", "learning", "certification", "course", "credential"],
    sourcePaths: ["lib/association/modules.ts", "lib/roadmap-modules.ts"],
    authorAgent: "healthcare-association-agent",
  },
  {
    topic: "Enterprise health system governance",
    category: "health_system",
    keywords: ["organization", "hospital", "enterprise", "rollup", "bulk"],
    sourcePaths: ["prisma/schema.prisma", "lib/enterprise/load-enterprise-summary.ts"],
    authorAgent: "health-system-agent",
  },
  {
    topic: "Fundraising and nonprofit surfaces",
    category: "nonprofit",
    keywords: ["PAC", "giving", "fundraising", "donor", "illustrative"],
    sourcePaths: ["lib/pac-marketing-preview.ts", "docs/PRODUCT-CLAIMS.md"],
    authorAgent: "nonprofit-agent",
  },
];

export function runResearchPipeline(query: ResearchQuery): ResearchPipelineResult {
  const search = searchSources(query);
  const analysis = analyzeSearchResults(search);
  const summary = summarizeAnalysis(analysis, query.sourcePaths);

  const finding: StoredFinding = {
    id: generateId("res"),
    topic: query.topic,
    category: query.category,
    summary: summary.executiveSummary,
    sources: summary.sources,
    recommendations: summary.keyFindings,
    authorAgent: query.authorAgent,
    createdAt: new Date().toISOString(),
    searchHitCount: search.hits.length,
    signals: analysis.signals,
    storedAt: new Date().toISOString(),
  };

  memoryWrite("research", finding, {
    title: query.topic,
    agentId: query.authorAgent,
    tags: [query.category, "pipeline"],
  });

  knowledgeWrite("competitors", {
    id: `intel-${finding.id}`,
    topic: query.topic,
    signals: analysis.signals,
    createdAt: finding.createdAt,
  }, { title: `Intel: ${query.topic}`, agentId: query.authorAgent, tags: ["pipeline"] });

  const { recommendations, taskIds } = createRecommendations(finding);

  return {
    search,
    analysis,
    summary,
    finding,
    recommendations,
    taskIds,
    completedAt: new Date().toISOString(),
  };
}

export function runFullResearchPipeline(queries = RESEARCH_QUERIES): ResearchPipelineResult[] {
  return queries.map(runResearchPipeline);
}
