/**
 * Database backup — $0 (local file copy or logical JSON export).
 *
 * Usage:
 *   pnpm continuity:backup
 *
 * SQLite: copies prisma/demo.db → backups/sqlite-<timestamp>.db
 * Postgres: writes backups/logical-<timestamp>.json (all tenant tables, no pg_dump required)
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../../lib/prisma";
import {
  BACKUPS_DIR,
  backupStamp,
  ensureBackupsDir,
  isSqliteUrl,
} from "./_shared";

async function logicalExport(): Promise<Record<string, unknown>> {
  const [
    organizations,
    members,
    events,
    registrations,
    memberNotes,
    automationExceptions,
    auditLogs,
    memberOrganizations,
    committees,
    advocacyIssues,
    emergencyContacts,
    integrationConnections,
  ] = await Promise.all([
    prisma.organization.findMany(),
    prisma.member.findMany(),
    prisma.event.findMany(),
    prisma.eventRegistration.findMany(),
    prisma.memberNote.findMany(),
    prisma.automationException.findMany(),
    prisma.auditLog.findMany({ take: 5000, orderBy: { createdAt: "desc" } }),
    prisma.memberOrganization.findMany(),
    prisma.committee.findMany(),
    prisma.advocacyIssue.findMany(),
    prisma.emergencyContact.findMany(),
    prisma.integrationConnection.findMany(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    counts: {
      organizations: organizations.length,
      members: members.length,
      events: events.length,
      registrations: registrations.length,
    },
    organizations,
    members,
    events,
    registrations,
    memberNotes,
    automationExceptions,
    auditLogs,
    memberOrganizations,
    committees,
    advocacyIssues,
    emergencyContacts,
    integrationConnections,
  };
}

async function main(): Promise<void> {
  ensureBackupsDir();
  const stamp = backupStamp();
  const url = process.env.DATABASE_URL ?? "file:./prisma/demo.db";

  if (isSqliteUrl(url)) {
    const src = path.resolve(url.replace(/^file:/, ""));
    if (!fs.existsSync(src)) {
      console.error(`SQLite file not found: ${src}. Run pnpm demo:setup`);
      process.exit(1);
    }
    const dest = path.join(BACKUPS_DIR, `sqlite-${stamp}.db`);
    fs.copyFileSync(src, dest);
    const meta = path.join(BACKUPS_DIR, `sqlite-${stamp}.json`);
    fs.writeFileSync(
      meta,
      JSON.stringify({ type: "sqlite-copy", source: src, dest, at: new Date().toISOString() }, null, 2),
    );
    console.log(`SQLite backup: ${dest}`);
  } else {
    const payload = await logicalExport();
    const dest = path.join(BACKUPS_DIR, `logical-${stamp}.json`);
    fs.writeFileSync(dest, JSON.stringify(payload, null, 2));
    const counts = payload.counts as { members: number };
    console.log(`Logical backup: ${dest} (${counts.members} members)`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
