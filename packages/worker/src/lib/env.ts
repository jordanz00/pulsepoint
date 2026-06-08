/**
 * Worker environment validation — zod schema enforced at boot.
 *
 * WHO THIS IS FOR: any developer wiring the worker into a new environment
 *   (local docker-compose, Container Apps, ACI, k8s).
 * WHAT IT DOES: parses `process.env` once and exposes a typed, frozen
 *   `env` object. Fails fast with a structured error if required vars are
 *   missing or malformed — Container Apps liveness will then restart the
 *   pod so misconfig surfaces in the platform.
 * HOW IT CONNECTS: imported by `worker.ts`, `process-sync-job.ts`,
 *   `health.ts`, `telemetry.ts`. No other file should read `process.env`
 *   directly — this is the single validation point.
 *
 * SECURITY: no secrets are logged. Only feature flags / endpoints /
 *   service names are surfaced through `env`. Connection strings stay
 *   inside `process.env` and are consumed by the Prisma / Redis clients.
 */
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  AMS_WORKER_QUEUE_NAME: z.string().default("ams-sync"),
  AMS_WORKER_CONCURRENCY: z.coerce.number().int().positive().default(2),
  AMS_WORKER_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  AMS_WORKER_BACKOFF_BASE_MS: z.coerce.number().int().positive().default(30_000),

  AMS_WORKER_ENABLE_FALLBACK_POLL: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  AMS_WORKER_FALLBACK_POLL_MS: z.coerce.number().int().positive().default(10_000),
  AMS_WORKER_FALLBACK_POLL_BATCH: z.coerce.number().int().positive().default(5),

  WORKER_HEALTH_PORT: z.coerce.number().int().positive().default(4100),
  WORKER_SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),

  OTEL_SERVICE_NAME: z.string().default("pulsepoint-ams-worker"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),

  PULSEPOINT_API_BASE_URL: z.string().optional(),
  PULSEPOINT_API_KEY: z.string().optional(),
});

export type WorkerEnv = z.infer<typeof schema>;

/**
 * Load and validate worker env. Throws a structured error on failure so
 * the orchestrator (Container Apps / k8s) can surface it in logs and
 * trigger a restart. Never logs secret values.
 */
export function loadEnv(): WorkerEnv {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    const err = new Error(`Worker env validation failed: ${issues.join("; ")}`);
    (err as Error & { code: string }).code = "AMS_ENV_001";
    throw err;
  }
  return Object.freeze(parsed.data);
}
