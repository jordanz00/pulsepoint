/**
 * Prisma singleton — PulsePoint
 *
 * Local prototype: SQLite via libSQL file (no Docker) — DATABASE_URL=file:./prisma/demo.db
 * Production: Postgres — DATABASE_URL=postgresql://...
 */

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function connectionUrl(): string {
  return process.env.DATABASE_URL ?? "file:./prisma/demo.db";
}

function createPrismaClient(): PrismaClient {
  const url = connectionUrl();

  if (url.startsWith("file:")) {
    const adapter = new PrismaLibSql({ url });
    return new PrismaClient({ adapter });
  }

  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
