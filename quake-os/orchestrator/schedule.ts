/**
 * Quake OS — Python-style scheduler.
 *
 * schedule.every().day.do(orchestrator.runDailyCycle)
 * schedule.runDue()
 */
import fs from "node:fs";
import path from "node:path";
import { QUAKE_OS_ROOT } from "@/quake-os/core/paths";

const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 604_800_000;
const STATE_PATH = path.join(QUAKE_OS_ROOT, "memory", "scheduler-state.json");

export type ScheduleInterval = "day" | "week";

export type ScheduledHandler = () => void | Promise<void>;

export type ScheduledJob = {
  id: string;
  interval: ScheduleInterval;
  handler: ScheduledHandler;
};

type SchedulerState = Record<string, string>;

const jobs: ScheduledJob[] = [];

function readState(): SchedulerState {
  if (!fs.existsSync(STATE_PATH)) return {};
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as SchedulerState;
}

function writeState(state: SchedulerState): void {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function intervalMs(interval: ScheduleInterval): number {
  return interval === "day" ? MS_PER_DAY : MS_PER_WEEK;
}

export function isJobDue(
  interval: ScheduleInterval,
  lastRun?: string,
  now = Date.now(),
): boolean {
  if (!lastRun) return true;
  return now - new Date(lastRun).getTime() >= intervalMs(interval);
}

function register(interval: ScheduleInterval, handler: ScheduledHandler, id?: string): ScheduledJob {
  const job: ScheduledJob = {
    id: id ?? `job-${jobs.length + 1}`,
    interval,
    handler,
  };
  jobs.push(job);
  return job;
}

/** Fluent API — mirrors Python `schedule.every().day.do(fn)`. */
export const schedule = {
  every() {
    return {
      day: {
        do(handler: ScheduledHandler, id?: string) {
          return register("day", handler, id);
        },
      },
      week: {
        do(handler: ScheduledHandler, id?: string) {
          return register("week", handler, id);
        },
      },
    };
  },
};

export function listScheduledJobs(): ScheduledJob[] {
  return [...jobs];
}

/** Test helper — clears in-memory job registry. */
export function clearScheduledJobs(): void {
  jobs.length = 0;
}

export type RunDueJobsResult = {
  executed: string[];
  skipped: string[];
  checkedAt: string;
};

/** Run handlers whose interval has elapsed since last execution. */
export async function runDueJobs(): Promise<RunDueJobsResult> {
  const state = readState();
  const executed: string[] = [];
  const skipped: string[] = [];
  const now = Date.now();

  for (const job of jobs) {
    if (!isJobDue(job.interval, state[job.id], now)) {
      skipped.push(job.id);
      continue;
    }

    await Promise.resolve(job.handler());
    state[job.id] = new Date().toISOString();
    executed.push(job.id);
  }

  writeState(state);

  return {
    executed,
    skipped,
    checkedAt: new Date().toISOString(),
  };
}
