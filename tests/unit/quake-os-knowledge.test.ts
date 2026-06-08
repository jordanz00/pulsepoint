import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeKnowledgeClients } from "@/quake-os/knowledge/client";
import {
  knowledgeWrite,
  knowledgeRead,
  knowledgeList,
  knowledgeSearch,
  getKnowledgeStatus,
} from "@/quake-os/knowledge/store";
import { memoryWrite, memoryRead } from "@/quake-os/core/memory-store";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quake-knowledge-"));

describe("Quake OS knowledge SQLite", () => {
  beforeAll(() => {
    process.env.QUAKE_KNOWLEDGE_ROOT = tmpRoot;
  });

  afterAll(() => {
    closeKnowledgeClients();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    delete process.env.QUAKE_KNOWLEDGE_ROOT;
  });

  it("writes and reads research entries", () => {
    knowledgeWrite(
      "research",
      {
        id: "res-test-001",
        topic: "AMS competitors",
        category: "competitor",
        summary: "Test summary",
        sources: ["test"],
        recommendations: [],
        authorAgent: "research-agent",
        createdAt: new Date().toISOString(),
      },
      { title: "AMS competitors", agentId: "research-agent" },
    );
    const row = knowledgeRead<{ id: string; topic: string }>("research", "res-test-001");
    expect(row?.topic).toBe("AMS competitors");
  });

  it("memoryWrite routes research category to SQLite", () => {
    memoryWrite(
      "decisions",
      {
        id: "dec-test-001",
        title: "Use SQLite for knowledge",
        context: "test",
        decision: "approved",
        alternatives: [],
        decidedBy: "cto-agent",
        status: "accepted",
        createdAt: new Date().toISOString(),
      },
      { title: "Use SQLite for knowledge" },
    );
    const row = memoryRead<{ title: string }>("decisions", "dec-test-001");
    expect(row?.title).toBe("Use SQLite for knowledge");
  });

  it("lists and searches knowledge", () => {
    const list = knowledgeList<{ id: string }>("research");
    expect(list.some((r) => r.id === "res-test-001")).toBe(true);
    const hits = knowledgeSearch("research", "competitors");
    expect(hits.length).toBeGreaterThan(0);
  });

  it("reports status for all six databases", () => {
    const status = getKnowledgeStatus();
    expect(Object.keys(status)).toEqual([
      "research",
      "requirements",
      "lessons",
      "competitors",
      "roadmap",
      "decisions",
      "audits",
      "tasks",
    ]);
    expect(status.research).toBeGreaterThan(0);
    expect(status.decisions).toBeGreaterThan(0);
  });
});
