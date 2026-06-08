#!/usr/bin/env tsx
/**
 * Migrate JSON memory files → SQLite knowledge databases.
 */
import fs from "node:fs";
import path from "node:path";
import { MEMORY_ROOT, LEGACY_DATA_ROOT, REPO_ROOT } from "@/quake-os/core/paths";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";
import { knowledgeWrite, getKnowledgeStatus } from "@/quake-os/knowledge/store";
import type { MemoryCategory } from "@/quake-os/core/types";

const KNOWLEDGE_CATEGORIES: MemoryCategory[] = [
  "research",
  "requirements",
  "decisions",
  "roadmaps",
  "lessons",
  "competitors",
];

function migrateJsonDir(category: MemoryCategory): number {
  const dir = path.join(MEMORY_ROOT, category);
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as { id: string };
    if (!raw.id) continue;
    knowledgeWrite(category, raw);
    n++;
  }
  return n;
}

function migrateCompetitiveIntel(): number {
  const intelPath = path.join(LEGACY_DATA_ROOT, "competitive-intel.json");
  if (!fs.existsSync(intelPath)) return 0;
  const raw = JSON.parse(fs.readFileSync(intelPath, "utf8")) as Record<string, unknown>;
  const id = "competitive-intel-registry";
  knowledgeWrite(
    "competitors",
    {
      id,
      title: "Competitive intel registry",
      sources: raw,
      migratedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { title: "Competitive intel registry", tags: ["registry", "migrate"] },
  );
  return 1;
}

function migrateLessonsLearnedMd(): number {
  const mdPath = path.join(LEGACY_DATA_ROOT, "lessons-learned.md");
  if (!fs.existsSync(mdPath)) return 0;
  const body = fs.readFileSync(mdPath, "utf8");
  knowledgeWrite(
    "lessons",
    {
      id: "lessons-learned-md",
      title: "Lessons learned log",
      body,
      createdAt: new Date().toISOString(),
    },
    { title: "Lessons learned log", tags: ["markdown", "migrate"] },
  );
  return 1;
}

function main(): void {
  const cmd = process.argv[2] ?? "migrate";

  initAllKnowledgeDbs();

  if (cmd === "status") {
    console.log(JSON.stringify(getKnowledgeStatus(), null, 2));
    return;
  }

  if (cmd === "init") {
    console.log(JSON.stringify({ initialized: true, counts: getKnowledgeStatus() }, null, 2));
    return;
  }

  let total = 0;
  for (const cat of KNOWLEDGE_CATEGORIES) {
    total += migrateJsonDir(cat);
  }
  total += migrateCompetitiveIntel();
  total += migrateLessonsLearnedMd();

  console.log(
    JSON.stringify(
      { migrated: total, counts: getKnowledgeStatus(), knowledgeRoot: path.join(REPO_ROOT, "knowledge") },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
