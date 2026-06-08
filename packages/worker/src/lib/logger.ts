/**
 * Structured JSON logger for the worker (pino).
 *
 * WHO THIS IS FOR: every worker module — no `console.log` anywhere.
 * WHAT IT DOES: emits one-line JSON per log record, suitable for
 *   Application Insights / Log Analytics ingestion. Adds the worker
 *   service name and pid for cross-pod correlation.
 * HOW IT CONNECTS: imported by `worker.ts`, `process-sync-job.ts`,
 *   `health.ts`, `pulsepoint-client.ts`, `telemetry.ts`.
 *
 * SECURITY: never log SyncJob.payload, audit before/after blobs, or
 *   PulsePoint request bodies — those may contain campaign metadata
 *   that should stay in the database. Log identifiers and counts only.
 */
import pino from "pino";

let logger: pino.Logger | null = null;

export function initLogger(opts: { level: string; serviceName: string }): pino.Logger {
  logger = pino({
    level: opts.level,
    base: {
      service: opts.serviceName,
      pid: process.pid,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "*.password",
        "*.apiKey",
        "*.authorization",
        "*.token",
        "headers.authorization",
        "*.PULSEPOINT_API_KEY",
      ],
      remove: true,
    },
  });
  return logger;
}

/**
 * Get the singleton logger. Throws if `initLogger` was not called first
 * — this enforces boot ordering: env → telemetry → logger → everything else.
 */
export function getLogger(): pino.Logger {
  if (!logger) {
    throw new Error("Logger not initialised. Call initLogger() during boot.");
  }
  return logger;
}
