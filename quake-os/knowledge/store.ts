/**
 * Quake OS — SQLite knowledge store (research, requirements, lessons, competitors, roadmap, decisions).
 */
import type { MemoryCategory } from "@/quake-os/core/types";
import { getKnowledgeDb } from "@/quake-os/knowledge/client";
import {
  CATEGORY_TO_DB,
  type KnowledgeDbName,
  type KnowledgeWriteMeta,
} from "@/quake-os/knowledge/types";

const UPSERT_SQL = `INSERT INTO knowledge_entries (id, title, agent_id, tags, payload, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    agent_id = excluded.agent_id,
    tags = excluded.tags,
    payload = excluded.payload,
    updated_at = excluded.updated_at`;

function dbForCategory(category: MemoryCategory): KnowledgeDbName | null {
  return CATEGORY_TO_DB[category] ?? null;
}

function extractTitle(record: Record<string, unknown>, meta?: KnowledgeWriteMeta): string {
  if (meta?.title) return meta.title;
  if (typeof record.title === "string") return record.title;
  if (typeof record.topic === "string") return record.topic;
  if (typeof record.name === "string") return record.name;
  if (typeof record.id === "string") return record.id;
  return "untitled";
}

function extractTimestamps(record: Record<string, unknown>): { createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();
  const createdAt = typeof record.createdAt === "string" ? record.createdAt : now;
  const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : createdAt;
  return { createdAt, updatedAt };
}

export function isKnowledgeCategory(category: MemoryCategory): boolean {
  return dbForCategory(category) !== null;
}

export function knowledgeWrite<T extends { id: string }>(
  category: MemoryCategory,
  record: T,
  meta?: KnowledgeWriteMeta,
): T {
  const dbName = dbForCategory(category);
  if (!dbName) throw new Error(`Category ${category} is not a knowledge DB category`);

  const database = getKnowledgeDb(dbName);
  const rec = record as Record<string, unknown>;
  const title = extractTitle(rec, meta);
  const { createdAt, updatedAt } = extractTimestamps(rec);
  const tags = JSON.stringify(meta?.tags ?? rec.tags ?? []);
  const agentId =
    meta?.agentId ??
    (typeof rec.authorAgent === "string"
      ? rec.authorAgent
      : typeof rec.decidedBy === "string"
        ? rec.decidedBy
        : typeof rec.reviewer === "string"
          ? rec.reviewer
          : null);

  database.prepare(UPSERT_SQL).run(
    record.id,
    title,
    agentId,
    tags,
    JSON.stringify(record),
    createdAt,
    updatedAt,
  );

  return record;
}

export function knowledgeRead<T>(category: MemoryCategory, id: string): T | null {
  const dbName = dbForCategory(category);
  if (!dbName) return null;

  const database = getKnowledgeDb(dbName);
  const row = database
    .prepare(`SELECT payload FROM knowledge_entries WHERE id = ?`)
    .get(id) as { payload: string } | undefined;
  if (!row?.payload) return null;
  return JSON.parse(row.payload) as T;
}

export function knowledgeList<T>(category: MemoryCategory, limit = 500): T[] {
  const dbName = dbForCategory(category);
  if (!dbName) return [];

  const database = getKnowledgeDb(dbName);
  const rows = database
    .prepare(`SELECT payload FROM knowledge_entries ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as Array<{ payload: string }>;

  return rows.map((r) => JSON.parse(r.payload) as T);
}

export function knowledgeSearch(
  category: MemoryCategory,
  query: string,
  limit = 50,
): Array<{ id: string; title: string; agentId: string | null; createdAt: string }> {
  const dbName = dbForCategory(category);
  if (!dbName) return [];

  const database = getKnowledgeDb(dbName);
  const q = `%${query.toLowerCase()}%`;
  const rows = database
    .prepare(
      `SELECT id, title, agent_id, created_at FROM knowledge_entries
       WHERE lower(title) LIKE ? OR lower(payload) LIKE ?
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(q, q, limit) as Array<{
    id: string;
    title: string;
    agent_id: string | null;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    agentId: r.agent_id,
    createdAt: r.created_at,
  }));
}

export function knowledgeCount(db: KnowledgeDbName): number {
  const database = getKnowledgeDb(db);
  const row = database.prepare(`SELECT COUNT(*) AS c FROM knowledge_entries`).get() as { c: number };
  return row?.c ?? 0;
}

export function getKnowledgeStatus(): Record<KnowledgeDbName, number> {
  return {
    research: knowledgeCount("research"),
    requirements: knowledgeCount("requirements"),
    lessons: knowledgeCount("lessons"),
    competitors: knowledgeCount("competitors"),
    roadmap: knowledgeCount("roadmap"),
    decisions: knowledgeCount("decisions"),
    audits: knowledgeCount("audits"),
    tasks: knowledgeCount("tasks"),
  };
}
