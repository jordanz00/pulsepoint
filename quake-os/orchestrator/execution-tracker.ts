/**
 * Quake OS — workflow execution tracking.
 */
import fs from "node:fs";
import path from "node:path";
import { QUAKE_OS_ROOT } from "@/quake-os/core/paths";
import { generateId } from "@/quake-os/core/memory-store";

export type ExecutionStatus = "running" | "completed" | "failed";

export type ExecutionRecord = {
  id: string;
  workflowId: string;
  agentIds: string[];
  taskIds: string[];
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, string | number>;
};

const STATE_PATH = path.join(QUAKE_OS_ROOT, "memory", "execution-log.json");

function readLog(): ExecutionRecord[] {
  if (!fs.existsSync(STATE_PATH)) return [];
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as ExecutionRecord[];
}

function writeLog(records: ExecutionRecord[]): void {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(records, null, 2));
}

export function startExecution(input: {
  workflowId: string;
  agentIds: string[];
  taskIds?: string[];
  metadata?: Record<string, string | number>;
}): ExecutionRecord {
  const record: ExecutionRecord = {
    id: generateId("exec"),
    workflowId: input.workflowId,
    agentIds: input.agentIds,
    taskIds: input.taskIds ?? [],
    status: "running",
    startedAt: new Date().toISOString(),
    metadata: input.metadata,
  };
  const log = readLog();
  log.unshift(record);
  writeLog(log.slice(0, 200));
  return record;
}

export function completeExecution(
  id: string,
  status: "completed" | "failed",
  error?: string,
): ExecutionRecord | null {
  const log = readLog();
  const idx = log.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  log[idx] = {
    ...log[idx],
    status,
    completedAt: new Date().toISOString(),
    error,
  };
  writeLog(log);
  return log[idx];
}

export function listExecutions(limit = 20): ExecutionRecord[] {
  return readLog().slice(0, limit);
}

export function getRunningExecutions(): ExecutionRecord[] {
  return readLog().filter((r) => r.status === "running");
}
