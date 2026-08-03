import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Shared SQLite (DATABASE_URL=file:./prisma/ci.db) cannot accept concurrent
 * writers from parallel Vitest files — CI fails with P1008 / SQLITE_BUSY.
 * Serialize files so integration suites and any DB-touching unit tests stay stable.
 */
const sqliteFileDb =
  !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:");

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    ...(sqliteFileDb
      ? {
          fileParallelism: false,
          maxWorkers: 1,
          pool: "forks",
          poolOptions: {
            forks: { singleFork: true },
          },
        }
      : {}),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
