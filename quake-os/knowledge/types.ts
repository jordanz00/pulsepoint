/**
 * Quake OS — SQLite knowledge database types.
 */
import type { MemoryCategory } from "@/quake-os/core/types";

export type KnowledgeDbName =
  | "research"
  | "requirements"
  | "lessons"
  | "competitors"
  | "roadmap"
  | "decisions"
  | "audits"
  | "tasks";

export const KNOWLEDGE_DB_FILES: Record<KnowledgeDbName, string> = {
  research: "research.db",
  requirements: "requirements.db",
  lessons: "lessons.db",
  competitors: "competitors.db",
  roadmap: "roadmap.db",
  decisions: "decisions.db",
  audits: "audits.db",
  tasks: "tasks.db",
};

/** Maps memory categories to SQLite database names. */
export const CATEGORY_TO_DB: Partial<Record<MemoryCategory, KnowledgeDbName>> = {
  research: "research",
  requirements: "requirements",
  lessons: "lessons",
  competitors: "competitors",
  roadmaps: "roadmap",
  decisions: "decisions",
  audits: "audits",
  tasks: "tasks",
};

export type KnowledgeRow = {
  id: string;
  title: string;
  agent_id: string | null;
  tags: string | null;
  payload: string;
  created_at: string;
  updated_at: string;
};

export type KnowledgeWriteMeta = {
  title?: string;
  agentId?: string;
  tags?: string[];
};
