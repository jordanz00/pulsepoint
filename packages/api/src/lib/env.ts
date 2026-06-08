/**
 * Environment validation — fail-fast contract for runtime config.
 *
 * WHO THIS IS FOR: api/src/server.ts boot path; any module reading process.env.
 * WHAT IT DOES: Parses + validates env vars with zod, with prod-stricter rules.
 *   Returns a typed object so the rest of the code never reaches into process.env.
 * HOW IT CONNECTS: server.ts imports `env` first thing after telemetry init.
 *   Failures throw at boot with a human-readable message; never silently default.
 *
 * SECURITY: No secrets logged on failure (only var names). Aligns with
 *   SECURE-FORCE.md "Never hardcode credentials" + "Fail safely".
 */

import { z } from "zod";

const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z
    .string()
    .regex(/^\d+$/, "API_PORT must be a positive integer")
    .default("4000"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  // Data plane
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL").optional(),

  // Web origin for CORS
  AMS_WEB_ORIGIN: z.string().url("AMS_WEB_ORIGIN must be a valid URL").optional(),

  // Auth
  AMS_AUTH_MODE: z.enum(["dev", "entra"]).optional(),
  AMS_DEV_AUTH_ALLOW_HEADER: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
  AZURE_TENANT_ID: z.string().optional(),
  AZURE_API_AUDIENCE: z.string().optional(),

  // PulsePoint integration
  PULSEPOINT_API_BASE_URL: z
    .string()
    .url("PULSEPOINT_API_BASE_URL must be a valid URL")
    .optional(),
  PULSEPOINT_API_KEY: z.string().optional(),

  // Observability
  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z
    .string()
    .url("OTEL_EXPORTER_OTLP_ENDPOINT must be a valid URL")
    .optional(),

  // Rate limit overrides
  AMS_RATE_LIMIT_MAX: z.string().regex(/^\d+$/).default("100"),
  AMS_RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).default("60000"),
});

export type RawEnv = z.infer<typeof baseSchema>;

export interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  isProduction: boolean;
  port: number;
  logLevel: RawEnv["LOG_LEVEL"];
  databaseUrl: string;
  redisUrl: string | undefined;
  webOrigin: string;
  authMode: "dev" | "entra";
  devAuthAllowHeader: boolean;
  azureTenantId: string | undefined;
  azureApiAudience: string | undefined;
  pulsepointApiBaseUrl: string | undefined;
  pulsepointApiKey: string | undefined;
  appInsightsConnectionString: string | undefined;
  otelExporterOtlpEndpoint: string | undefined;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

/**
 * Load + validate environment variables.
 *
 * WHO THIS IS FOR: server boot; tests building isolated apps via buildApp().
 * WHAT IT DOES: Parses process.env, applies production-only requirements,
 *   and returns a typed AppEnv. Throws on any failure with the failing var
 *   names listed; no values printed (avoid secret leaks in logs).
 *
 * In production these vars are REQUIRED on top of base schema:
 *   AMS_WEB_ORIGIN, REDIS_URL, AZURE_TENANT_ID, AZURE_API_AUDIENCE.
 *
 * @returns typed environment
 * @throws Error with comma-separated list of missing/invalid var names
 */
export function loadEnv(): AppEnv {
  const parsed = baseSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((i) => i.path.join("."))
      .filter((f, idx, arr) => arr.indexOf(f) === idx);
    throw new Error(
      `Invalid environment configuration: ${fields.join(", ")}. ` +
        `Check .env / deployment secrets.`,
    );
  }

  const raw = parsed.data;
  const isProduction = raw.NODE_ENV === "production";
  const authMode: "dev" | "entra" =
    raw.AMS_AUTH_MODE ?? (isProduction ? "entra" : "dev");

  const missing: string[] = [];
  if (isProduction) {
    if (!raw.REDIS_URL) missing.push("REDIS_URL");
    if (!raw.AMS_WEB_ORIGIN) missing.push("AMS_WEB_ORIGIN");
  }
  if (authMode === "entra") {
    if (!raw.AZURE_TENANT_ID) missing.push("AZURE_TENANT_ID");
    if (!raw.AZURE_API_AUDIENCE) missing.push("AZURE_API_AUDIENCE");
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${raw.NODE_ENV} / authMode=${authMode}: ${missing.join(
        ", ",
      )}`,
    );
  }

  return {
    nodeEnv: raw.NODE_ENV,
    isProduction,
    port: parseInt(raw.API_PORT, 10),
    logLevel: raw.LOG_LEVEL,
    databaseUrl: raw.DATABASE_URL,
    redisUrl: raw.REDIS_URL,
    webOrigin: raw.AMS_WEB_ORIGIN ?? "http://localhost:3001",
    authMode,
    devAuthAllowHeader: raw.AMS_DEV_AUTH_ALLOW_HEADER === "true",
    azureTenantId: raw.AZURE_TENANT_ID,
    azureApiAudience: raw.AZURE_API_AUDIENCE,
    pulsepointApiBaseUrl: raw.PULSEPOINT_API_BASE_URL,
    pulsepointApiKey: raw.PULSEPOINT_API_KEY,
    appInsightsConnectionString: raw.APPLICATIONINSIGHTS_CONNECTION_STRING,
    otelExporterOtlpEndpoint: raw.OTEL_EXPORTER_OTLP_ENDPOINT,
    rateLimitMax: parseInt(raw.AMS_RATE_LIMIT_MAX, 10),
    rateLimitWindowMs: parseInt(raw.AMS_RATE_LIMIT_WINDOW_MS, 10),
  };
}

/** Singleton — loaded once per process. Re-export for ergonomic imports. */
let cached: AppEnv | null = null;
export function getEnv(): AppEnv {
  if (!cached) cached = loadEnv();
  return cached;
}
