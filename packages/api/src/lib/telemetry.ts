/**
 * OpenTelemetry bootstrap — no-op unless an exporter is configured.
 *
 * WHO THIS IS FOR: server.ts boot path. MUST be imported FIRST, before any
 *   instrumented module (Fastify, Prisma, Redis), so auto-instrumentations
 *   can wrap them at require-time.
 * WHAT IT DOES: If APPLICATIONINSIGHTS_CONNECTION_STRING is set, wires the
 *   Azure Monitor exporter. Else if OTEL_EXPORTER_OTLP_ENDPOINT is set,
 *   wires the generic OTLP exporter via @opentelemetry/sdk-node. Otherwise
 *   returns a no-op shutdown handle.
 * HOW IT CONNECTS: server.ts calls initTelemetry() once at module top.
 *   Graceful shutdown invokes the returned `shutdown()` to flush spans.
 *
 * SECURITY: Connection strings are read from env only — never logged in full.
 *   Failures during init are caught and logged; the app continues without
 *   telemetry rather than failing to start.
 */

export interface TelemetryHandle {
  /** Best-effort flush + shutdown; safe to call multiple times. */
  shutdown: () => Promise<void>;
  /** Which exporter is active, for log line at boot. */
  mode: "azure-monitor" | "otlp" | "noop";
}

const NOOP: TelemetryHandle = {
  shutdown: async () => {
    /* no-op */
  },
  mode: "noop",
};

/**
 * Initialize OpenTelemetry once at process boot.
 *
 * WHO THIS IS FOR: server.ts only.
 * WHAT IT DOES: Lazy-imports the SDK + auto-instrumentations so the cold-path
 *   stays light when telemetry is disabled. Returns a handle for graceful
 *   shutdown.
 *
 * @returns telemetry handle (noop if no exporter configured)
 */
export async function initTelemetry(): Promise<TelemetryHandle> {
  const aiConn = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (!aiConn && !otlpEndpoint) return NOOP;

  try {
    if (aiConn) {
      // Azure Monitor SDK self-registers OTel auto-instrumentations.
      // Dynamic optional import; types not guaranteed present.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await dynamicImport("@azure/monitor-opentelemetry-exporter").catch(() => null);
      if (!mod) return NOOP;
      const { AzureMonitorTraceExporter } = mod;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sdkMod: any = await dynamicImport("@opentelemetry/sdk-node").catch(() => null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoMod: any = await dynamicImport("@opentelemetry/auto-instrumentations-node").catch(() => null);
      if (!sdkMod || !autoMod) return NOOP;

      const exporter = new AzureMonitorTraceExporter({ connectionString: aiConn });
      const sdk = new sdkMod.NodeSDK({
        traceExporter: exporter,
        instrumentations: [autoMod.getNodeAutoInstrumentations()],
      });
      sdk.start();
      return {
        mode: "azure-monitor",
        shutdown: () => sdk.shutdown().catch(() => undefined),
      };
    }

    // OTLP HTTP fallback — use same dynamic import helper to avoid missing-type errors.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynImp = new Function("m", "return import(m)") as (m: string) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sdkMod: any = await dynImp("@opentelemetry/sdk-node").catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const autoMod: any = await dynImp("@opentelemetry/auto-instrumentations-node").catch(() => null);
    if (!sdkMod || !autoMod) return NOOP;

    const sdk = new sdkMod.NodeSDK({
      instrumentations: [autoMod.getNodeAutoInstrumentations()],
    });
    sdk.start();
    return {
      mode: "otlp",
      shutdown: () => sdk.shutdown().catch(() => undefined),
    };
  } catch {
    // Telemetry failures must NEVER prevent the app from booting.
    return NOOP;
  }
}
