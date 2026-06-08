import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";
import { createTask } from "@/quake-os/core/task-engine";
import {
  runFeatureReviewChain,
  summarizeReviewChain,
} from "@/quake-os/core/feature-review-chain";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-frc-"));

describe("Feature review chain", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("runs Developer → QA → Auditor → Architecture → SME → CEO", () => {
    const task = createTask({
      id: "task-frc-test-001",
      title: "Hospital advocacy take-action form",
      description: "Member-facing advocacy response",
      priority: "P1",
      businessImpact: "high",
      technicalComplexity: "medium",
      dependencies: [],
      ownerAgent: "developer-agent",
      researchSources: [],
      acceptanceCriteria: ["Form validates", "Tenant isolated"],
      tags: ["advocacy", "healthcare"],
    });

    const result = runFeatureReviewChain(task.id);
    expect(result).not.toBeNull();
    expect(result!.developer.agentId).toBe("developer-agent");
    expect(result!.qa.agentId).toBe("qa-agent");
    expect(result!.auditorCritique.reviewer).toBe("auditor-agent");
    expect(result!.architectureCritique.reviewer).toBe("architecture-agent");
    expect(result!.healthcareSmeCritique.reviewer).toBe("healthcare-sme-agent");
    expect(result!.ceoApproval.agentId).toBe("ceo-agent");
    expect(["SHIP", "REVISE", "REJECT"]).toContain(result!.ceoApproval.verdict);
    expect(summarizeReviewChain(result!)).toContain("CEO:");
  });
});
