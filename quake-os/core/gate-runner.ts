/**
 * Quake OS — programmatic gate execution for QA agent.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { REPO_ROOT } from "@/quake-os/core/paths";

export type GateCheckResult = {
  command: string;
  status: "pass" | "fail" | "skipped";
  durationMs: number;
  output?: string;
};

export type GateSuiteResult = {
  command: string;
  checks: GateCheckResult[];
  passed: boolean;
  completedAt: string;
};

const DEFAULT_TIMEOUT_MS = 120_000;

function runCommand(command: string, timeoutMs = DEFAULT_TIMEOUT_MS): GateCheckResult {
  const started = Date.now();
  try {
    const output = execSync(command, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      timeout: timeoutMs,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return {
      command,
      status: "pass",
      durationMs: Date.now() - started,
      output: output.slice(-500),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      command,
      status: "fail",
      durationMs: Date.now() - started,
      output: message.slice(-500),
    };
  }
}

export function shouldRunGates(): boolean {
  return process.env.QUAKE_OS_RUN_GATES === "1" || process.env.QUAKE_OS_RUN_GATES === "true";
}

export function runGateSuite(input?: { dryRun?: boolean }): GateSuiteResult {
  const suite = path.join(REPO_ROOT, "scripts", "quake-gates.sh");
  const command = `bash ${suite}`;

  if (input?.dryRun || !shouldRunGates()) {
    return {
      command,
      checks: [{ command, status: "skipped", durationMs: 0, output: "Set QUAKE_OS_RUN_GATES=1 to execute" }],
      passed: true,
      completedAt: new Date().toISOString(),
    };
  }

  const result = runCommand(command);
  return {
    command,
    checks: [result],
    passed: result.status === "pass",
    completedAt: new Date().toISOString(),
  };
}
