/**
 * Retry Prisma writes under SQLite file DB (CI) when SQLITE_BUSY / P1008 fires.
 */
export async function withSqliteBusyRetry<T>(
  label: string,
  fn: () => Promise<T>,
  opts?: { attempts?: number; baseMs?: number },
): Promise<T> {
  const attempts = opts?.attempts ?? 8;
  const baseMs = opts?.baseMs ?? 50;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      const msg = err instanceof Error ? err.message : String(err);
      const busy =
        msg.includes("SQLITE_BUSY") ||
        msg.includes("database is locked") ||
        msg.includes("P1008") ||
        msg.includes("Operation has timed out") ||
        msg.includes("SocketTimeout");
      if (!busy || i === attempts - 1) {
        throw err;
      }
      const wait = baseMs * 2 ** i + Math.floor(Math.random() * 25);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw last instanceof Error ? last : new Error(`${label}: retry exhausted`);
}
