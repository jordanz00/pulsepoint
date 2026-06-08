import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { AgentOrchestrator, runDailyCycle, bootstrapOs } from "@/quake-os/orchestrator/index";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-daily-test-"));

describe("AgentOrchestrator daily cycle", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
    bootstrapOs();
  }, 60_000);

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("runs full pipeline and returns audit", () => {
    const result = new AgentOrchestrator().runDailyCycle();

    expect(result.id).toMatch(/^daily-/);
    expect(result.research.agentId).toBe("research-agent");
    expect(result.architecture.agentId).toBe("architecture-agent");
    expect(result.product.agentId).toBe("product-agent");
    expect(result.developer.agentId).toBe("developer-agent");
    expect(result.developer.status).toBe("dispatched");
    expect(result.qa.agentId).toBe("qa-agent");
    expect(result.qa.gateCommand).toBe("pnpm quake:gates");
    expect(result.audit.reviewer).toBe("auditor-agent");
    expect(["APPROVED", "NEEDS_REVISION", "REJECTED"]).toContain(result.audit.verdict);
  });

  it("runDailyCycle() functional alias works", () => {
    const result = runDailyCycle();
    expect(result.audit).toBeDefined();
    expect(result.completedAt >= result.startedAt).toBe(true);
  });
});
