/**
 * Quake OS — continuous research engine.
 * Delegates to Search → Analyze → Summarize → Store → Recommend pipeline.
 */
import type { AgentId, AgentResearch } from "@/quake-os/core/types";
import { publishRecommendation } from "@/quake-os/core/communication";
import { generateId, memoryList, memoryWrite } from "@/quake-os/core/memory-store";
import { createTaskFromResearch } from "@/quake-os/core/task-engine";
import { runFullResearchPipeline } from "@/quake-os/research/pipeline";

export type ResearchTopicTemplate = {
  topic: string;
  category: AgentResearch["category"];
  authorAgent: AgentId;
  summaryTemplate: string;
  sources: string[];
  recommendations: string[];
  autoTask?: {
    title: string;
    description: string;
    priority: "P1" | "P2" | "P3";
    ownerAgent: AgentId;
    acceptanceCriteria: string[];
  };
};

const DAILY_RESEARCH_TOPICS: ResearchTopicTemplate[] = [
  {
    topic: "AMS competitor landscape — Fonteva, iMIS, Protech, Nimble",
    category: "competitor",
    authorAgent: "research-agent",
    summaryTemplate:
      "Hospital associations evaluate AMS on advocacy depth, hospital roster modeling, dues automation, and Microsoft 365 integration. PulsePoint differentiates on modern stack + healthcare packaging.",
    sources: ["data/quake-os/competitive-intel.json", "docs/PROTECH-FEATURE-MAP.md"],
    recommendations: [
      "Maintain honest Live/Alpha/Roadmap labels per docs/PRODUCT-CLAIMS.md",
      "Prioritize advocacy take-action + hospital participation KPIs",
    ],
    autoTask: {
      title: "Refresh competitive intel registry quarterly",
      description: "Update competitive-intel.json with pricing motion and module parity notes.",
      priority: "P2",
      ownerAgent: "research-agent",
      acceptanceCriteria: ["competitive-intel.json updated", "wave report filed"],
    },
  },
  {
    topic: "State hospital association advocacy workflows",
    category: "hospital_association",
    authorAgent: "hospital-association-agent",
    summaryTemplate:
      "Associations need issue tracking, legislator targeting, hospital participation rates, and grassroots email. PAC linkage is separate compliance track.",
    sources: ["docs/PRODUCT-CLAIMS.md", "lib/advocacy-dashboard.ts"],
    recommendations: [
      "Harden alpha modules toward Block 2 GA (Commerce, Learn, Engage)",
      "Legislative vendor feed remains roadmap — stub only",
    ],
  },
  {
    topic: "Healthcare association CE and credentialing",
    category: "healthcare_association",
    authorAgent: "healthcare-association-agent",
    summaryTemplate:
      "Professional societies need CE credits, certification paths, and roster by credential. Pulse learning module is roadmap — document gaps honestly.",
    sources: ["lib/association/modules.ts", "docs/ROADMAP-MODULES.md"],
    recommendations: ["Define CE credit schema in requirements registry", "Alpha badge on learning surfaces"],
  },
  {
    topic: "Multi-hospital enterprise governance",
    category: "health_system",
    authorAgent: "health-system-agent",
    summaryTemplate:
      "Health systems need parent/child org accounts, delegated admins, and consolidated reporting. OrganizationAccount model supports hospital roster today.",
    sources: ["prisma/schema.prisma", "enterprise/organizations"],
    recommendations: [
      "Enterprise rollup dashboards on command center",
      "Insights export parity before GA claim",
    ],
  },
  {
    topic: "Nonprofit fundraising and donor trends",
    category: "nonprofit",
    authorAgent: "nonprofit-agent",
    summaryTemplate:
      "Associations blend dues + PAC + foundation giving. Donor CRM and pledge tracking remain roadmap; PAC preview is illustrative only.",
    sources: ["lib/pac-marketing-preview.ts", "docs/PRODUCT-CLAIMS.md"],
    recommendations: ["Keep PAC marketing labeled illustrative", "Connect giving module to real Stripe when pilot ready"],
  },
  {
    topic: "AI copilot opportunities for association staff",
    category: "ai_trends",
    authorAgent: "innovation-agent",
    summaryTemplate:
      "Executive brief copilot and member 360 narratives are in-repo. Next: advocacy issue summarization offline-safe.",
    sources: ["lib/copilot/executive-brief.ts", "modules/ai-helpers patterns"],
    recommendations: ["Extend AI helpers modularly", "No fabricated stats in narratives"],
  },
];

export function runResearchCycle(options?: {
  topics?: ResearchTopicTemplate[];
  usePipeline?: boolean;
}): {
  research: AgentResearch[];
  tasksCreated: string[];
  recommendations: string[];
} {
  if (options?.usePipeline !== false) {
    const pipeline = runFullResearchPipeline();
    return {
      research: pipeline.map((p) => p.finding),
      tasksCreated: pipeline.flatMap((p) => p.taskIds),
      recommendations: pipeline.flatMap((p) => p.recommendations.map((r) => r.id)),
    };
  }

  const topics = options?.topics ?? DAILY_RESEARCH_TOPICS;
  const research: AgentResearch[] = [];
  const tasksCreated: string[] = [];
  const recommendations: string[] = [];

  for (const tpl of topics) {
    const existing = memoryList<AgentResearch>("research").find(
      (r) => r.topic === tpl.topic && r.createdAt > new Date(Date.now() - 86400000).toISOString(),
    );
    if (existing) {
      research.push(existing);
      continue;
    }

    const record: AgentResearch = {
      id: generateId("res"),
      topic: tpl.topic,
      category: tpl.category,
      summary: tpl.summaryTemplate,
      sources: tpl.sources,
      recommendations: tpl.recommendations,
      authorAgent: tpl.authorAgent,
      createdAt: new Date().toISOString(),
    };
    memoryWrite("research", record, { title: tpl.topic, agentId: tpl.authorAgent, tags: [tpl.category] });
    research.push(record);

    for (const rec of tpl.recommendations) {
      const recommendation = publishRecommendation({
        title: rec,
        rationale: `From research: ${tpl.topic}`,
        proposedBy: tpl.authorAgent,
        targetAgents: ["product-agent", "ceo-agent"],
        linkedTaskIds: [],
        priority: "P2",
      });
      recommendations.push(recommendation.id);
    }

    if (tpl.autoTask) {
      const task = createTaskFromResearch({
        title: tpl.autoTask.title,
        description: tpl.autoTask.description,
        priority: tpl.autoTask.priority,
        ownerAgent: tpl.autoTask.ownerAgent,
        researchId: record.id,
        acceptanceCriteria: tpl.autoTask.acceptanceCriteria,
      });
      tasksCreated.push(task.id);
    }
  }

  return { research, tasksCreated, recommendations };
}

export function listRecentResearch(limit = 10): AgentResearch[] {
  return memoryList<AgentResearch>("research")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
