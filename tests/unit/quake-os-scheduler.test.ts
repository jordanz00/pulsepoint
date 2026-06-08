import { describe, expect, it, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  schedule,
  runDueJobs,
  clearScheduledJobs,
  isJobDue,
  listScheduledJobs,
} from "@/quake-os/orchestrator/schedule";
import { QUAKE_OS_ROOT } from "@/quake-os/core/paths";

const STATE_PATH = path.join(QUAKE_OS_ROOT, "memory", "scheduler-state.json");

describe("Quake OS schedule", () => {
  beforeEach(() => {
    clearScheduledJobs();
    if (fs.existsSync(STATE_PATH)) fs.unlinkSync(STATE_PATH);
  });

  it("registers daily jobs with fluent API", () => {
    const calls: string[] = [];
    schedule.every().day.do(() => {
      calls.push("daily");
    }, "test-daily");

    expect(listScheduledJobs()).toHaveLength(1);
    expect(listScheduledJobs()[0]?.id).toBe("test-daily");
  });

  it("runDueJobs executes handler when never run", async () => {
    let ran = false;
    schedule.every().day.do(() => {
      ran = true;
    }, "fresh-job");

    const result = await runDueJobs();

    expect(ran).toBe(true);
    expect(result.executed).toContain("fresh-job");
  });

  it("runDueJobs skips job inside interval window", async () => {
    let count = 0;
    schedule.every().day.do(() => {
      count += 1;
    }, "throttled-job");

    await runDueJobs();
    const second = await runDueJobs();

    expect(count).toBe(1);
    expect(second.skipped).toContain("throttled-job");
  });

  it("isJobDue respects elapsed interval", () => {
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    expect(isJobDue("day", hourAgo)).toBe(false);
    expect(isJobDue("day")).toBe(true);
  });
});

describe("scheduled-jobs registry", () => {
  it("registers daily-cycle on orchestrator", async () => {
    const { listScheduledJobs: listFromScheduler } = await import(
      "@/quake-os/orchestrator/scheduler"
    );
    const ids = listFromScheduler().map((j) => j.id);
    expect(ids).toContain("daily-cycle");
    expect(ids).toContain("daily-research");
    expect(ids).toContain("continuous-improvement");
  });
});
