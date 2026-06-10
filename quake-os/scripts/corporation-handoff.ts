#!/usr/bin/env tsx
/**
 * Print Cursor handoff from latest corporation cycle wave report.
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@/quake-os/core/paths";

const wavesDir = path.join(REPO_ROOT, "data", "quake-os", "waves");

function latestCorporationReport(): string | null {
  if (!fs.existsSync(wavesDir)) return null;
  const files = fs
    .readdirSync(wavesDir)
    .filter((f) => f.includes("corporation-cycle") && f.endsWith(".md"))
    .sort()
    .reverse();
  return files[0] ? path.join(wavesDir, files[0]) : null;
}

const reportPath = latestCorporationReport();
if (!reportPath) {
  console.error("No corporation cycle report found. Run: pnpm quake:os:corporation");
  process.exit(1);
}

const content = fs.readFileSync(reportPath, "utf8");
const handoffMatch = content.match(/## Cursor handoff\n\n```([\s\S]*?)```/);

console.log(`# Corporation handoff\n`);
console.log(`Source: ${path.relative(REPO_ROOT, reportPath)}\n`);

if (handoffMatch?.[1]) {
  console.log(handoffMatch[1].trim());
} else {
  console.log(content);
}

console.log(`\n---\nRun in Cursor:\n@quake-os-orchestrator ${handoffMatch?.[1]?.trim().split("\n")[0] ?? "Implement top corporation tasks"}`);
