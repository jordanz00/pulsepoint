import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";
import { runDiscoveryPipeline } from "@/quake-os/core/discovery-pipeline";
import { PAC_MANAGEMENT_DISCOVERY } from "@/quake-os/research/discoveries";
import { knowledgeRead } from "@/quake-os/knowledge/store";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-discovery-"));

describe("Discovery pipeline", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("Research → ticket → Product → Developer → QA → Auditor", () => {
    const result = runDiscoveryPipeline(PAC_MANAGEMENT_DISCOVERY);
    expect(result).not.toBeNull();

    expect(result!.discovery.finding.topic).toBe(
      "Hospital associations need better PAC management.",
    );
    expect(result!.discovery.ticket.title).toBe(PAC_MANAGEMENT_DISCOVERY.insight);
    expect(result!.discovery.searchHitCount).toBeGreaterThan(0);

    expect(result!.requirements.agentId).toBe("product-agent");
    expect(result!.requirements.userStories.length).toBeGreaterThanOrEqual(3);
    expect(result!.requirements.acceptanceCriteria.length).toBeGreaterThanOrEqual(4);

    const req = knowledgeRead<{ userStories: string[] }>(
      "requirements",
      result!.requirements.requirementId,
    );
    expect(req?.userStories?.length).toBeGreaterThan(0);

    expect(result!.buildReview.developer.agentId).toBe("developer-agent");
    expect(result!.buildReview.qa.agentId).toBe("qa-agent");
    expect(result!.buildReview.auditorReview.reviewer).toBe("auditor-agent");
  });
});
