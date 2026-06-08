/**
 * Stack health — $0 monitoring (local cron or GitHub Actions).
 *
 * Usage:
 *   pnpm continuity:health
 *   PRIMARY_URL=https://your.vercel.app STANDBY_URL=http://localhost:3000 pnpm continuity:health
 *
 * Exit 1 if primary (when set) or database check fails.
 */

import "dotenv/config";
import { prisma } from "../../lib/prisma";
import { isDemoModeEnabled } from "../../lib/demo-mode-gates";
import { fetchHealth } from "./_shared";

async function checkDatabase(): Promise<{ ok: boolean; detail: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, detail: "connected" };
  } catch (e) {
    return {
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main(): Promise<void> {
  const primary = process.env.PRIMARY_URL?.trim();
  const standby = process.env.STANDBY_URL?.trim() ?? "http://localhost:3000";
  let failed = false;

  console.log("== PulsePoint stack health ==");
  console.log(`time: ${new Date().toISOString()}`);
  console.log(`demo_mode: ${isDemoModeEnabled() ? "on" : "off"}`);

  const db = await checkDatabase();
  console.log(`database: ${db.ok ? "OK" : "FAIL"} (${db.detail})`);
  if (!db.ok) failed = true;

  if (primary) {
    const p = await fetchHealth(primary);
    console.log(`primary ${primary}: ${p.ok ? "OK" : "FAIL"} (${p.status}) ${p.body ?? ""}`);
    if (!p.ok) failed = true;
  } else {
    console.log("primary: skipped (set PRIMARY_URL to monitor Vercel)");
  }

  const s = await fetchHealth(standby);
  console.log(`standby ${standby}: ${s.ok ? "OK" : "FAIL"} (${s.status})`);
  if (!s.ok && process.env.REQUIRE_STANDBY === "true") failed = true;

  await prisma.$disconnect();

  if (failed) {
    console.error("\nHealth check FAILED. See docs/FREE-CONTINUITY-TOOLKIT.md");
    process.exit(1);
  }
  console.log("\nHealth check passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
