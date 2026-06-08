/**
 * Quake OS — SQLite schema for knowledge databases.
 */
export const KNOWLEDGE_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  agent_id TEXT,
  tags TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_created ON knowledge_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_agent ON knowledge_entries(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge_entries(title);
`;
