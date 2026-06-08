import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { bootstrapOs, getOsStatus, runWave } from "@/quake-os/orchestrator/index";
import { createTask, listTasks, pickTopTasks } from "@/quake-os/core/task-engine";
import { runAudit } from "@/quake-os/core/audit-engine";
import { runResearchCycle } from "@/quake-os/core/research-engine";
import { getGraph, seedKnowledgeGraph } from "@/quake-os/knowledge-graph/store";
import { loadAgentRegistry } from "@/quake-os/core/agent-registry";
import { sendMessage } from "@/quake-os/core/communication";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-os-test-"));

describe("Quake OS", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
    bootstrapOs();
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("loads agent registry", () => {
    const agents = loadAgentRegistry();
    expect(agents.length).toBeGreaterThanOrEqual(12);
    expect(agents.find((a) => a.id === "ceo-agent")).toBeDefined();
  });

  it("bootstraps memory and knowledge graph", () => {
    const graph = getGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
  });

  it("creates and lists tasks", () => {
    const task = createTask({
      id: "task-test-os-001",
      title: "OS test task",
      description: "Test",
      priority: "P3",
      businessImpact: "low",
      technicalComplexity: "low",
      dependencies: [],
      ownerAgent: "qa-agent",
      researchSources: [],
      acceptanceCriteria: ["pass"],
    });
    expect(task.id).toBe("task-test-os-001");
    expect(listTasks({ ownerAgent: "qa-agent" }).some((t) => t.id === task.id)).toBe(true);
  });

  it("picks top tasks by priority", () => {
    const top = pickTopTasks(3);
    expect(top.length).toBeLessThanOrEqual(3);
  });

  it("runs audit with verdict", () => {
    const audit = runAudit({ subject: "OS test", subjectType: "architecture" });
    expect(["APPROVED", "NEEDS_REVISION", "REJECTED"]).toContain(audit.verdict);
  });

  it("runs research cycle", () => {
    const result = runResearchCycle();
    expect(result.research.length).toBeGreaterThan(0);
  });

  it("sends agent messages", () => {
    const msg = sendMessage({
      from: "ceo-agent",
      to: "cto-agent",
      subject: "Test message",
      body: "Hello",
    });
    expect(msg.id).toMatch(/^msg-/);
  });

  it("returns OS status", () => {
    const status = getOsStatus();
    expect(status.version).toBe("1.0.0");
    expect(status.agents).toBeGreaterThan(0);
  });

  it("runs orchestrated wave", () => {
    const report = runWave({ name: "test-wave", taskCount: 2, runResearch: false });
    expect(report.tasksPicked.length).toBeLessThanOrEqual(2);
    expect(report.agentsActivated.length).toBeGreaterThan(0);
  });

  it("seeds knowledge graph relations", () => {
    seedKnowledgeGraph();
    const graph = getGraph();
    expect(graph.edges.some((e) => e.relation === "requires")).toBe(true);
    expect(
      graph.edges.some(
        (e) =>
          e.from === "feat-advocacy" &&
          e.to === "req-take-action" &&
          e.relation === "implements",
      ),
    ).toBe(true);
    expect(
      graph.edges.filter(
        (e) => e.from === "feat-advocacy" && e.to === "req-take-action",
      ).length,
    ).toBe(1);
  });
});
