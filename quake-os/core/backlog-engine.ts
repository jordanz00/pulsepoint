/**
 * Quake OS — self-generating backlog engine.
 *
 * Sources: legacy JSON, AMS module gaps, research, audits, recommendations.
 */
import fs from "node:fs";
import path from "node:path";
import type { AgentId, AgentTask, TaskPriority } from "@/quake-os/core/types";
import { REPO_ROOT } from "@/quake-os/core/paths";
import { generateId, memoryList, memoryWrite, syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { createTask, listTasks } from "@/quake-os/core/task-engine";
import { modulesByPhase } from "@/quake-os/ams/core/modules";
import { knowledgeWrite } from "@/quake-os/knowledge/store";

export type BacklogSource =
  | "legacy"
  | "ams"
  | "research"
  | "audits"
  | "recommendations";

export type BacklogRefreshResult = {
  id: string;
  sources: BacklogSource[];
  tasksCreated: string[];
  tasksSkipped: number;
  roadmapSnapshotId: string;
  completedAt: string;
};

function taskExists(title: string): boolean {
  return listTasks().some(
    (t) => t.title === title && t.status !== "done" && t.status !== "cancelled",
  );
}

function createBacklogTask(input: {
  title: string;
  description: string;
  priority: TaskPriority;
  ownerAgent: AgentId;
  tags: string[];
  acceptanceCriteria?: string[];
  human?: boolean;
}): AgentTask | null {
  if (taskExists(input.title)) return null;
  return createTask({
    id: generateId("task"),
    title: input.title,
    description: input.description,
    priority: input.priority,
    businessImpact: input.priority === "P0" ? "critical" : input.priority === "P1" ? "high" : "medium",
    technicalComplexity: "medium",
    dependencies: [],
    ownerAgent: input.ownerAgent,
    researchSources: [],
    acceptanceCriteria: input.acceptanceCriteria ?? [
      "Implemented",
      "Tests pass",
      "Audit approved",
    ],
    tags: input.tags,
    human: input.human,
  });
}

function fromAmsGaps(): string[] {
  const ids: string[] = [];
  for (const mod of modulesByPhase("foundation").slice(0, 5)) {
    const task = createBacklogTask({
      title: `Advance ${mod.title} to alpha`,
      description: mod.summary,
      priority: "P2",
      ownerAgent: "developer-agent",
      tags: ["ams-roadmap", "auto-backlog", mod.id],
      acceptanceCriteria: [
        "Module phase updated in docs/PRODUCT-CLAIMS.md",
        "Tenant guards on mutations",
        "Task completion audit passes",
      ],
    });
    if (task) ids.push(task.id);
  }
  for (const mod of modulesByPhase("roadmap").slice(0, 2)) {
    const task = createBacklogTask({
      title: `Roadmap: ${mod.title}`,
      description: mod.summary,
      priority: "P3",
      ownerAgent: "product-agent",
      tags: ["ams-roadmap", "roadmap", mod.id],
    });
    if (task) ids.push(task.id);
  }
  return ids;
}

function fromResearch(): string[] {
  const ids: string[] = [];
  const research = memoryList<{ id: string; topic: string; summary: string; recommendations: string[] }>(
    "research",
  );
  for (const r of research.slice(-10)) {
    for (const rec of r.recommendations.slice(0, 1)) {
      const title = rec.slice(0, 120);
      const task = createBacklogTask({
        title,
        description: `From research ${r.topic}: ${r.summary}`,
        priority: "P2",
        ownerAgent: "product-agent",
        tags: ["auto-backlog", "research", r.id],
      });
      if (task) ids.push(task.id);
    }
  }
  return ids;
}

function fromAudits(): string[] {
  const ids: string[] = [];
  const audits = memoryList<{
    id: string;
    subject: string;
    verdict: string;
    recommendations: string[];
  }>("audits");
  for (const a of audits.filter((x) => x.verdict !== "APPROVED").slice(-5)) {
    for (const rec of (a.recommendations ?? []).slice(0, 1)) {
      const task = createBacklogTask({
        title: `Audit fix: ${rec.slice(0, 100)}`,
        description: `From audit ${a.subject}`,
        priority: "P1",
        ownerAgent: "developer-agent",
        tags: ["auto-backlog", "audit", a.id],
      });
      if (task) ids.push(task.id);
    }
  }
  return ids;
}

function fromRecommendations(): string[] {
  const ids: string[] = [];
  const recs = memoryList<{
    id: string;
    title: string;
    rationale: string;
    priority: TaskPriority;
    proposedBy: AgentId;
  }>("recommendations");
  for (const rec of recs.slice(-15)) {
    const task = createBacklogTask({
      title: rec.title.slice(0, 120),
      description: rec.rationale,
      priority: rec.priority,
      ownerAgent: rec.proposedBy === "research-agent" ? "product-agent" : "developer-agent",
      tags: ["auto-backlog", "recommendation", rec.id],
    });
    if (task) ids.push(task.id);
  }
  return ids;
}

function writeRoadmapSnapshot(openTasks: AgentTask[]): string {
  const snapshot = {
    id: generateId("roadmap"),
    generatedAt: new Date().toISOString(),
    openCount: openTasks.length,
    byPriority: {
      P0: openTasks.filter((t) => t.priority === "P0").length,
      P1: openTasks.filter((t) => t.priority === "P1").length,
      P2: openTasks.filter((t) => t.priority === "P2").length,
      P3: openTasks.filter((t) => t.priority === "P3").length,
    },
    topTasks: openTasks.slice(0, 10).map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      ownerAgent: t.ownerAgent,
    })),
  };
  knowledgeWrite("roadmaps", snapshot, {
    title: `Roadmap snapshot ${snapshot.generatedAt.slice(0, 10)}`,
    tags: ["auto-backlog", "roadmap"],
  });
  return snapshot.id;
}

export function refreshBacklog(sources: BacklogSource[] = [
  "legacy",
  "ams",
  "research",
  "audits",
  "recommendations",
]): BacklogRefreshResult {
  const tasksCreated: string[] = [];
  let tasksSkipped = 0;

  if (sources.includes("legacy")) {
    const synced = syncLegacyBacklog();
    if (synced > 0) {
      tasksCreated.push(...listTasks().slice(-synced).map((t) => t.id));
    }
  }

  const generators: Record<Exclude<BacklogSource, "legacy">, () => string[]> = {
    ams: fromAmsGaps,
    research: fromResearch,
    audits: fromAudits,
    recommendations: fromRecommendations,
  };

  for (const source of sources) {
    if (source === "legacy") continue;
    const gen = generators[source];
    const ids = gen();
    tasksCreated.push(...ids);
  }

  const open = listTasks({ status: ["pending", "in_progress", "review", "blocked"] });
  tasksSkipped = open.length - tasksCreated.length;

  const legacyPath = path.join(REPO_ROOT, "data", "quake-os", "improvement-backlog.json");
  if (fs.existsSync(legacyPath)) {
    const raw = JSON.parse(fs.readFileSync(legacyPath, "utf8")) as { _meta?: Record<string, unknown> };
    raw._meta = {
      ...raw._meta,
      lastBacklogRefresh: new Date().toISOString(),
      openTasks: open.length,
    };
    fs.writeFileSync(legacyPath, JSON.stringify(raw, null, 2));
  }

  const result: BacklogRefreshResult = {
    id: generateId("backlog"),
    sources,
    tasksCreated: [...new Set(tasksCreated)],
    tasksSkipped: Math.max(0, tasksSkipped),
    roadmapSnapshotId: writeRoadmapSnapshot(open),
    completedAt: new Date().toISOString(),
  };

  memoryWrite("lessons", result, {
    title: `Backlog refresh: ${result.tasksCreated.length} new tasks`,
    tags: ["backlog", "auto-generated"],
  });

  return result;
}
