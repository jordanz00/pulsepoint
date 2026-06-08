/**
 * Quake OS — SQLite client factory (node:sqlite DatabaseSync, file-backed).
 */
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { KNOWLEDGE_ROOT } from "@/quake-os/core/paths";
import { KNOWLEDGE_TABLE_DDL } from "@/quake-os/knowledge/schema";
import type { KnowledgeDbName } from "@/quake-os/knowledge/types";
import { KNOWLEDGE_DB_FILES } from "@/quake-os/knowledge/types";

const databases = new Map<KnowledgeDbName, DatabaseSync>();

function knowledgeRoot(): string {
  const root = process.env.QUAKE_KNOWLEDGE_ROOT ?? KNOWLEDGE_ROOT;
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  return root;
}

export function getKnowledgeDbPath(db: KnowledgeDbName): string {
  return `${knowledgeRoot()}/${KNOWLEDGE_DB_FILES[db]}`;
}

export function getKnowledgeDb(db: KnowledgeDbName): DatabaseSync {
  let database = databases.get(db);
  if (!database) {
    database = new DatabaseSync(getKnowledgeDbPath(db));
    database.exec("PRAGMA journal_mode=WAL");
    database.exec("PRAGMA busy_timeout=5000");
    database.exec(KNOWLEDGE_TABLE_DDL);
    databases.set(db, database);
  }
  return database;
}

export function initAllKnowledgeDbs(): KnowledgeDbName[] {
  const dbs = Object.keys(KNOWLEDGE_DB_FILES) as KnowledgeDbName[];
  for (const name of dbs) {
    getKnowledgeDb(name);
  }
  return dbs;
}

export function closeKnowledgeClients(): void {
  for (const db of databases.values()) {
    db.close();
  }
  databases.clear();
}
