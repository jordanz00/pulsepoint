/**
 * Quake OS — persistent file-backed memory (survives sessions).
 */
import fs from "node:fs";
import path from "node:path";
import type { MemoryCategory, MemoryIndex, MemoryIndexEntry } from "@/quake-os/core/types";
import {
  MEMORY_CATEGORIES,
  MEMORY_INDEX_PATH,
  MEMORY_ROOT,
  memoryCategoryDir,
} from "@/quake-os/core/paths";
import {
  isKnowledgeCategory,
  knowledgeList,
  knowledgeRead,
  knowledgeWrite,
} from "@/quake-os/knowledge/store";
import { CATEGORY_TO_DB } from "@/quake-os/knowledge/types";
import { KNOWLEDGE_DB_FILES } from "@/quake-os/knowledge/types";

function ensureDirs(): void {
  if (!fs.existsSync(MEMORY_ROOT)) fs.mkdirSync(MEMORY_ROOT, { recursive: true });
  for (const cat of MEMORY_CATEGORIES) {
    const dir = memoryCategoryDir(cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function readIndex(): MemoryIndex {
  ensureDirs();
  if (!fs.existsSync(MEMORY_INDEX_PATH)) {
    return { version: 1, updatedAt: new Date().toISOString(), entries: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(MEMORY_INDEX_PATH, "utf8")) as MemoryIndex;
  } catch {
    const backup = `${MEMORY_INDEX_PATH}.corrupt-${Date.now()}.bak`;
    fs.copyFileSync(MEMORY_INDEX_PATH, backup);
    const fresh: MemoryIndex = { version: 1, updatedAt: new Date().toISOString(), entries: [] };
    writeIndex(fresh);
    return fresh;
  }
}

function writeIndex(index: MemoryIndex): void {
  index.updatedAt = new Date().toISOString();
  fs.writeFileSync(MEMORY_INDEX_PATH, JSON.stringify(index, null, 2));
}

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${ts}-${rand}`;
}

export function memoryWrite<T extends { id: string }>(
  category: MemoryCategory,
  record: T,
  meta?: { title?: string; agentId?: string; tags?: string[] },
): T {
  ensureDirs();

  if (isKnowledgeCategory(category)) {
    knowledgeWrite(category, record, meta);
  } else {
    const filePath = path.join(memoryCategoryDir(category), `${record.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
  }

  const index = readIndex();
  const title =
    meta?.title ??
    ("title" in record && typeof (record as { title?: string }).title === "string"
      ? (record as { title: string }).title
      : record.id);
  const existing = index.entries.findIndex((e) => e.id === record.id && e.category === category);
  const entry: MemoryIndexEntry = {
    id: record.id,
    category,
    title,
    agentId: meta?.agentId,
    createdAt:
      "createdAt" in record && typeof (record as { createdAt?: string }).createdAt === "string"
        ? (record as { createdAt: string }).createdAt
        : new Date().toISOString(),
    path: isKnowledgeCategory(category)
      ? `knowledge/${KNOWLEDGE_DB_FILES[CATEGORY_TO_DB[category]!]}`
      : path.relative(REPO_ROOT(), path.join(memoryCategoryDir(category), `${record.id}.json`)),
    tags: meta?.tags,
  };
  if (existing >= 0) index.entries[existing] = entry;
  else index.entries.push(entry);
  writeIndex(index);
  return record;
}

export function memoryRead<T>(category: MemoryCategory, id: string): T | null {
  if (isKnowledgeCategory(category)) {
    const fromDb = knowledgeRead<T>(category, id);
    if (fromDb) return fromDb;
  }
  const filePath = path.join(memoryCategoryDir(category), `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function memoryList<T>(category: MemoryCategory): T[] {
  if (isKnowledgeCategory(category)) {
    const fromDb = knowledgeList<T>(category);
    if (fromDb.length > 0) return fromDb;
  }
  const dir = memoryCategoryDir(category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as T);
}

export function memorySearch(query: string, category?: MemoryCategory): MemoryIndexEntry[] {
  const q = query.toLowerCase();
  const index = readIndex();
  return index.entries.filter((e) => {
    if (category && e.category !== category) return false;
    return (
      e.title.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      (e.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
    );
  });
}

export function getMemorySummary(): {
  totalEntries: number;
  byCategory: Record<string, number>;
  lastUpdated: string;
} {
  const index = readIndex();
  const byCategory: Record<string, number> = {};
  for (const e of index.entries) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
  }
  return {
    totalEntries: index.entries.length,
    byCategory,
    lastUpdated: index.updatedAt,
  };
}

function REPO_ROOT(): string {
  return path.resolve(__dirname, "../..");
}

/** Bridge legacy data/quake-os JSON into OS memory index on first read. */
export function syncLegacyBacklog(): number {
  const legacyPath = path.join(REPO_ROOT(), "data", "quake-os", "improvement-backlog.json");
  if (!fs.existsSync(legacyPath)) return 0;
  const raw = JSON.parse(fs.readFileSync(legacyPath, "utf8")) as {
    items?: Array<{
      id: string;
      title: string;
      priority: string;
      status: string;
      notes?: string;
      agents?: string[];
      division?: string;
      human?: boolean;
    }>;
  };
  let synced = 0;
  const now = new Date().toISOString();
  for (const item of raw.items ?? []) {
    const taskId = item.id.startsWith("BL-") ? item.id : `BL-${item.id}`;
    const status =
      item.status === "done"
        ? "done"
        : item.status === "in_progress"
          ? "in_progress"
          : "pending";
    const existing = memoryRead<{
      id: string;
      title: string;
      description?: string;
      status: string;
      updatedAt: string;
      createdAt: string;
      [key: string]: unknown;
    }>("tasks", taskId);
    if (existing) {
      if (existing.status !== status || existing.title !== item.title) {
        memoryWrite(
          "tasks",
          {
            ...existing,
            title: item.title,
            description: item.notes ?? existing.description ?? "",
            status,
            updatedAt: now,
            division: item.division,
            human: item.human,
            tags: item.agents,
          },
          { title: item.title, tags: item.agents },
        );
        synced++;
      }
      continue;
    }
    memoryWrite(
      "tasks",
      {
        id: taskId,
        title: item.title,
        description: item.notes ?? "",
        priority: item.priority as "P0" | "P1" | "P2" | "P3",
        businessImpact: item.priority === "P0" ? "critical" : item.priority === "P1" ? "high" : "medium",
        technicalComplexity: "medium",
        dependencies: [],
        ownerAgent: item.agents?.[0] ?? "quake-os-product-agent",
        status,
        researchSources: [],
        acceptanceCriteria: [],
        createdAt: now,
        updatedAt: now,
        division: item.division,
        human: item.human,
        tags: item.agents,
      },
      { title: item.title, tags: item.agents },
    );
    synced++;
  }
  return synced;
}
