import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";
import { createTask } from "@/quake-os/core/task-engine";
import { completeTaskWithAudit } from "@/quake-os/core/task-completion-audit";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-task-audit-"));

describe("Task completion audit", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("runs QA + Security + Auditor gate", () => {
    const task = createTask({
      id: "task-audit-test-001",
      title: "Audit gate test",
      description: "Test task",
      priority: "P3",
      businessImpact: "low",
      technicalComplexity: "low",
      dependencies: [],
      ownerAgent: "developer-agent",
      researchSources: [],
      acceptanceCriteria: ["pass"],
    });

    const result = completeTaskWithAudit(task.id);
    expect(result).not.toBeNull();
    expect(result!.qaAudit.reviewer).toBe("auditor-agent");
    expect(result!.securityAudit.reviewer).toBe("architecture-agent");
    expect(result!.auditorAudit.reviewer).toBe("healthcare-sme-agent");
  });
});
