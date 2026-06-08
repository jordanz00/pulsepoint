/**
 * Quake OS — filesystem paths (repo-root relative).
 */
import path from "node:path";

export const REPO_ROOT = path.resolve(__dirname, "../..");

export const QUAKE_OS_ROOT = path.join(REPO_ROOT, "quake-os");
export const MEMORY_ROOT = path.join(QUAKE_OS_ROOT, "memory");
export const KNOWLEDGE_GRAPH_PATH = path.join(QUAKE_OS_ROOT, "knowledge-graph", "graph.json");
export const AGENT_REGISTRY_PATH = path.join(QUAKE_OS_ROOT, "agents", "registry.json");
export const MEMORY_INDEX_PATH = path.join(MEMORY_ROOT, "index.json");
export const LEGACY_DATA_ROOT = path.join(REPO_ROOT, "data", "quake-os");
export const KNOWLEDGE_ROOT = path.join(REPO_ROOT, "knowledge");

export const MEMORY_CATEGORIES = [
  "research",
  "requirements",
  "decisions",
  "roadmaps",
  "lessons",
  "competitors",
  "tasks",
  "audits",
  "messages",
  "recommendations",
] as const;

export function memoryCategoryDir(category: string): string {
  return path.join(MEMORY_ROOT, category);
}
