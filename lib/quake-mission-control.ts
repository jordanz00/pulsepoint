/**
 * Quake Mission Control — live org + build telemetry for in-app operator dashboard.
 * Reads repo truth only; never invents stats.
 */

import fs from "node:fs";
import path from "node:path";
import { bootstrapOs, getOsStatus, getCorporationSummary, CORPORATION_DIVISIONS } from "@/quake-os/orchestrator/index";
import { listExecutions } from "@/quake-os/orchestrator/execution-tracker";

const REPO_ROOT = process.cwd();

export type QuakeBacklogSummary = {
  total: number;
  done: number;
  pending: number;
  lastUpdated: string;
  openHuman: string[];
};

export type QuakeWaveSummary = {
  filename: string;
  title: string;
  date: string;
};

export type QuakeCorporationDivision = {
  id: string;
  name: string;
  lead: string;
  agentCount: number;
  mandate: string;
  cadence: string;
};

export type QuakeMissionControlData = {
  os: ReturnType<typeof getOsStatus>;
  corporation: ReturnType<typeof getCorporationSummary>;
  divisions: QuakeCorporationDivision[];
  recentExecutions: { workflowId: string; status: string; startedAt: string }[];
  backlog: QuakeBacklogSummary;
  recentWaves: QuakeWaveSummary[];
  build: {
    tsFiles: number;
    testFileCount: number;
    complianceDocs: number;
  };
  workflow: {
    name: string;
    phases: { id: string; label: string; command: string }[];
  };
};

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function countFiles(dir: string, ext: string): number {
  let count = 0;
  const walk = (d: string) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "generated") {
        continue;
      }
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(ext)) count += 1;
    }
  };
  walk(dir);
  return count;
}

function summarizeBacklog(): QuakeBacklogSummary {
  type BacklogFile = {
    _meta?: { lastUpdated?: string };
    items?: { id: string; title: string; status: string; human?: boolean }[];
  };
  const data = readJsonSafe<BacklogFile>(
    path.join(REPO_ROOT, "data/quake-os/improvement-backlog.json"),
    { items: [] },
  );
  const items = data.items ?? [];
  const done = items.filter((i) => i.status === "done").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const openHuman = items
    .filter((i) => i.status === "pending" && i.human)
    .map((i) => `${i.id}: ${i.title}`);
  return {
    total: items.length,
    done,
    pending,
    lastUpdated: data._meta?.lastUpdated ?? "unknown",
    openHuman,
  };
}

function listRecentWaves(limit = 6): QuakeWaveSummary[] {
  const wavesDir = path.join(REPO_ROOT, "data/quake-os/waves");
  if (!fs.existsSync(wavesDir)) return [];
  return fs
    .readdirSync(wavesDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, limit)
    .map((filename) => {
      const firstLine =
        fs
          .readFileSync(path.join(wavesDir, filename), "utf8")
          .split("\n")
          .find((l) => l.startsWith("# ")) ?? filename;
      const title = firstLine.replace(/^#\s*/, "").trim();
      const date = filename.slice(0, 10);
      return { filename, title, date };
    });
}

export function loadQuakeMissionControl(): QuakeMissionControlData {
  bootstrapOs();
  const os = getOsStatus();

  const tsFiles =
    countFiles(path.join(REPO_ROOT, "app"), ".tsx") +
    countFiles(path.join(REPO_ROOT, "app"), ".ts") +
    countFiles(path.join(REPO_ROOT, "lib"), ".ts") +
    countFiles(path.join(REPO_ROOT, "components"), ".tsx");

  const testFileCount = countFiles(path.join(REPO_ROOT, "tests"), ".ts");
  const complianceDocs = fs.existsSync(path.join(REPO_ROOT, "docs"))
    ? fs.readdirSync(path.join(REPO_ROOT, "docs")).filter((f) => f.endsWith(".md")).length
    : 0;

  const corporation = getCorporationSummary();
  const divisions = CORPORATION_DIVISIONS.map((d) => ({
    id: d.id,
    name: d.name,
    lead: d.leadAgentId,
    agentCount: d.agents.length,
    mandate: d.mandate,
    cadence: d.cadence,
  }));
  const recentExecutions = listExecutions(5).map((e) => ({
    workflowId: e.workflowId,
    status: e.status,
    startedAt: e.startedAt,
  }));

  return {
    os,
    corporation,
    divisions,
    recentExecutions,
    backlog: summarizeBacklog(),
    recentWaves: listRecentWaves(),
    build: { tsFiles, testFileCount, complianceDocs },
    workflow: {
      name: "Quake Corporation Cycle",
      phases: [
        { id: "corporation", label: "Full corporation cycle (7 divisions)", command: "pnpm quake:os:corporation" },
        { id: "research", label: "Research + backlog pick", command: "pnpm quake:os:research" },
        { id: "build", label: "Implement + unit tests", command: "pnpm test" },
        { id: "gates", label: "Hard quality gates", command: "pnpm quake:gates" },
        { id: "automation", label: "Gates + backlog + wave", command: "pnpm quake:automation:run" },
        { id: "demo", label: "Leadership loop walkthrough", command: "/{org}/leadership" },
        { id: "ship", label: "Human merge + pilot", command: "docs/QUAKE-SHIP-WORKFLOW.md" },
      ],
    },
  };
}
