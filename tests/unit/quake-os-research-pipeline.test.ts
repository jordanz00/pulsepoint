import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";
import { runResearchPipeline } from "@/quake-os/research/pipeline";
import { searchSources } from "@/quake-os/research/search";
import { analyzeSearchResults } from "@/quake-os/research/analyze";
import { summarizeAnalysis } from "@/quake-os/research/summarize";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-research-"));

describe("Research pipeline", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("searches local sources", () => {
    const search = searchSources({
      topic: "Product claims",
      category: "competitor",
      keywords: ["PRODUCT", "claims", "Live"],
      sourcePaths: ["docs/PRODUCT-CLAIMS.md"],
      authorAgent: "research-agent",
    });
    expect(search.hits.length).toBeGreaterThan(0);
  });

  it("analyzes and summarizes", () => {
    const search = searchSources({
      topic: "Test",
      category: "ams_market",
      keywords: ["roadmap", "alpha"],
      sourcePaths: ["lib/association/modules.ts"],
      authorAgent: "research-agent",
    });
    const analysis = analyzeSearchResults(search);
    const summary = summarizeAnalysis(analysis, ["lib/association/modules.ts"]);
    expect(summary.executiveSummary).toContain("Topic:");
    expect(analysis.signals.length).toBeGreaterThan(0);
  });

  it("runs full pipeline end-to-end", () => {
    const result = runResearchPipeline({
      topic: "Pipeline test",
      category: "membership",
      keywords: ["member", "tenant"],
      sourcePaths: ["docs/SCALE-AND-SECURITY.md"],
      authorAgent: "research-agent",
    });
    expect(result.finding.id).toMatch(/^res-/);
    expect(result.search.hits.length).toBeGreaterThan(0);
    expect(result.summary.executiveSummary.length).toBeGreaterThan(10);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.taskIds.length).toBeGreaterThan(0);
  });
});
