import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  CORPORATION_DIVISIONS,
  getCorporationSummary,
  listCorporationAgents,
} from "@/quake-os/core/corporation";
import { runCorporationCycle } from "@/quake-os/orchestrator/corporation-orchestrator";
import { closeKnowledgeClients, initAllKnowledgeDbs } from "@/quake-os/knowledge/client";
import { syncLegacyBacklog } from "@/quake-os/core/memory-store";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-corp-test-"));

describe("Quake OS Corporation", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
    syncLegacyBacklog();
    initAllKnowledgeDbs();
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("defines 7 corporation divisions", () => {
    expect(CORPORATION_DIVISIONS.length).toBe(7);
    const summary = getCorporationSummary();
    expect(summary.divisions).toBe(7);
    expect(summary.agents).toBeGreaterThanOrEqual(10);
  });

  it("lists unique corporation agents", () => {
    const agents = listCorporationAgents();
    expect(agents).toContain("ceo-agent");
    expect(agents).toContain("developer-agent");
    expect(agents).toContain("compliance-agent");
    expect(new Set(agents).size).toBe(agents.length);
  });

  it("runs full corporation cycle end-to-end", () => {
    const result = runCorporationCycle();
    expect(result.id).toMatch(/^corp-/);
    expect(result.divisions.length).toBeGreaterThanOrEqual(4);
    expect(result.product.taskIds.length).toBeGreaterThan(0);
    expect(["SHIP", "REVISE", "STOP"]).toContain(result.executive.boardVerdict);
    expect(result.agentsActivated.length).toBeGreaterThanOrEqual(8);
    expect(["APPROVED", "NEEDS_REVISION", "REJECTED"]).toContain(result.audit.verdict);
  });
});
