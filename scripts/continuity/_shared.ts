/**
 * Shared helpers for zero-cost continuity scripts.
 */

import fs from "node:fs";
import path from "node:path";

export const BACKUPS_DIR = path.join(process.cwd(), "backups");

export function backupStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

export function ensureBackupsDir(): void {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

export function isPostgresUrl(url: string): boolean {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export function isSqliteUrl(url: string): boolean {
  return url.startsWith("file:");
}

export async function fetchHealth(baseUrl: string): Promise<{
  ok: boolean;
  status: number;
  body?: string;
}> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/health`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text.slice(0, 200) };
  } catch (e) {
    return { ok: false, status: 0, body: e instanceof Error ? e.message : String(e) };
  }
}
