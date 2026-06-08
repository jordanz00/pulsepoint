/**
 * OpenTelemetry boot for the worker. No-op when no exporter is configured.
 *
 * WHO THIS IS FOR: ops / observability — pairs with App Insights or any
 *   OTLP collector via `OTEL_EXPORTER_OTLP_ENDPOINT`.
 * WHAT IT DOES: starts the auto-instrumentations SDK so BullMQ, Prisma,
 *   ioredis, http, fetch, and pino are traced without code changes. When
 *   no endpoint is set we still register the SDK with the default
 *   resource so `service.name` is consistent across spans (useful for
 *   in-memory dev) but no exporter is attached.
 * HOW IT CONNECTS: `worker.ts` calls `initTelemetry()` BEFORE any other
 *   imports that might hold module-scope handles (Prisma, ioredis,
 *   BullMQ Worker). This matches the OTel auto-instrumentation
 *   contract.
 *
 * SECURITY: no secrets are exported. The OTLP endpoint URL itself is
 *   considered configuration, not a secret.
 *
 * TODO(IT): when Application Insights is provisioned, set
 *   `OTEL_EXPORTER_OTLP_ENDPOINT` and (optionally)
 *   `APPLICATIONINSIGHTS_CONNECTION_STRING` via Key Vault. The auto
 *   instrumentations package picks these up automatically.
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

let sdk: NodeSDK | null = null;

export interface TelemetryOptions {
  serviceName: string;
  exporterEndpoint?: string;
}

export function initTelemetry(opts: TelemetryOptions): void {
  if (sdk) return;
  process.env.OTEL_SERVICE_NAME = opts.serviceName;
  if (opts.exporterEndpoint) {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = opts.exporterEndpoint;
  }
  sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
  });
  sdk.start();
}

export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch {
    // best-effort shutdown — never block process exit on telemetry
  }
  sdk = null;
}
