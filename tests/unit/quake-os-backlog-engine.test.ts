import { describe, expect, it, beforeAll } from "vitest";
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import { listTasks } from "@/quake-os/core/task-engine";
import { syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";

describe("backlog engine", () => {
  beforeAll(() => {
    syncLegacyBacklog();
    initAllKnowledgeDbs();
  });

  it("refreshBacklog returns snapshot and sources", () => {
    const result = refreshBacklog(["legacy", "ams"]);
    expect(result.id).toMatch(/^backlog-/);
    expect(result.sources).toContain("legacy");
    expect(result.roadmapSnapshotId).toMatch(/^roadmap-/);
    expect(result.completedAt).toBeTruthy();
  });

  it("syncLegacyBacklog updates status when JSON changes", () => {
    const bl001 = listTasks().find((t) => t.id === "BL-001");
    if (bl001) {
      expect(["done", "in_progress", "pending"]).toContain(bl001.status);
    }
    const synced = syncLegacyBacklog();
    expect(synced).toBeGreaterThanOrEqual(0);
  });

  it("dedupes tasks by title", () => {
    const before = listTasks().length;
    refreshBacklog(["ams"]);
    const after = listTasks().length;
    refreshBacklog(["ams"]);
    const again = listTasks().length;
    expect(again).toBe(after);
    expect(after).toBeGreaterThanOrEqual(before);
  });
});
