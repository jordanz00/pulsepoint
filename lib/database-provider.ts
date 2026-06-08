/**
 * Detect database provider for query tuning (SQLite local vs Neon Postgres production).
 */

export function isPostgresDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function isSqliteDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("file:") || url === "" || !isPostgresDatabase();
}
