/**
 * Quake OS Research Pipeline — Search → Analyze → Summarize → Store → Recommend
 */
import type { AgentResearch } from "@/quake-os/core/types";

export type ResearchQuery = {
  topic: string;
  category: AgentResearch["category"];
  keywords: string[];
  sourcePaths: string[];
  authorAgent: string;
};

export type SearchHit = {
  source: string;
  path: string;
  excerpt: string;
  relevance: number;
  matchedKeywords: string[];
};

export type SearchResult = {
  query: ResearchQuery;
  hits: SearchHit[];
  searchedAt: string;
};

export type AnalysisSignal = {
  type: "gap" | "strength" | "risk" | "opportunity";
  label: string;
  evidence: string[];
  confidence: "high" | "medium" | "low";
};

export type AnalysisResult = {
  topic: string;
  signals: AnalysisSignal[];
  sourceCount: number;
  analyzedAt: string;
};

export type ResearchSummary = {
  topic: string;
  executiveSummary: string;
  keyFindings: string[];
  sources: string[];
  analyzedAt: string;
};

export type StoredFinding = AgentResearch & {
  searchHitCount: number;
  signals: AnalysisSignal[];
  storedAt: string;
};

export type ResearchRecommendation = {
  id: string;
  title: string;
  rationale: string;
  priority: "P0" | "P1" | "P2" | "P3";
  ownerAgent: string;
  linkedResearchId: string;
};

export type ResearchPipelineResult = {
  search: SearchResult;
  analysis: AnalysisResult;
  summary: ResearchSummary;
  finding: StoredFinding;
  recommendations: ResearchRecommendation[];
  taskIds: string[];
  completedAt: string;
};
