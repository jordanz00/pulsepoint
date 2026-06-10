import { describe, expect, it } from "vitest";
import { buildMissionControlOpsCards } from "@/lib/mission-control-ops-brief";
import type { QuakeMissionControlData } from "@/lib/quake-mission-control";

const fixture = {
  os: {
    version: "0.1.0",
    tasks: { done: 37, pending: 1, total: 38 },
    audits: { approved: 9, total: 10 },
  },
  corporation: { divisions: 7, agents: 28 },
  divisions: [],
  recentExecutions: [],
  backlog: {
    done: 37,
    total: 38,
    pending: 1,
    lastUpdated: "2026-06-11",
    openHuman: ["BL-003 staging pilot"],
  },
  recentWaves: [{ filename: "2026-06-11.md", date: "2026-06-11", title: "Sprint 1" }],
  build: { tsFiles: 800, testFileCount: 90, complianceDocs: 3 },
  workflow: {
    name: "Quake Execute",
    phases: [{ id: "gates", label: "Quality gates", command: "pnpm quake:gates" }],
  },
} as unknown as QuakeMissionControlData;

describe("buildMissionControlOpsCards", () => {
  it("returns five operator questions", () => {
    const cards = buildMissionControlOpsCards(fixture);
    expect(cards).toHaveLength(5);
    expect(cards[0]!.question).toMatch(/What is happening/i);
    expect(cards[2]!.answer).toContain("BL-003");
    expect(cards[4]!.answer).toContain("pnpm quake:gates");
  });
});
