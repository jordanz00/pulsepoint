import { describe, expect, it, beforeAll } from "vitest";
import { runWorkflow, dailyCycleFromWorkflow } from "@/quake-os/core/workflow-engine";
import { listServiceAgents } from "@/quake-os/agents/services/service-registry";
import { syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";

describe("workflow engine", () => {
  beforeAll(() => {
    syncLegacyBacklog();
    initAllKnowledgeDbs();
  });

  it("lists 12 service agents", () => {
    const agents = listServiceAgents();
    expect(agents).toContain("research-agent");
    expect(agents).toContain("developer-agent");
    expect(agents).toContain("compliance-agent");
    expect(agents.length).toBeGreaterThanOrEqual(10);
  });

  it("runs daily-cycle workflow end-to-end", () => {
    const run = runWorkflow("daily-cycle");
    expect(run).not.toBeNull();
    expect(run!.workflowId).toBe("daily-cycle");
    expect(run!.steps.length).toBeGreaterThanOrEqual(6);

    const pipeline = dailyCycleFromWorkflow(run!);
    expect(pipeline.research.agentId).toBe("research-agent");
    expect(pipeline.audit.reviewer).toBe("auditor-agent");
    expect(["APPROVED", "NEEDS_REVISION", "REJECTED"]).toContain(pipeline.audit.verdict);
  });
});
