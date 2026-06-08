/**
 * Lightweight HTTP health probe for the worker.
 *
 * WHO THIS IS FOR: Container Apps / k8s liveness + readiness probes.
 *   The worker is not an HTTP service, but the platform expects a
 *   `/health` endpoint to detect stuck pods.
 * WHAT IT DOES: serves `GET /health` on `WORKER_HEALTH_PORT` returning
 *   `{ ok, queue, processed, failed, dead, uptimeSec }`. No DB or Redis
 *   I/O — staying liveness-only keeps the probe cheap and isolated
 *   from queue load.
 * HOW IT CONNECTS: instantiated by `worker.ts`. Counters are mutated
 *   by the BullMQ event handlers in `worker.ts`.
 *
 * SECURITY: read-only, no input validation needed (only GET /health
 *   responds 200; everything else 404). No state leaks beyond
 *   queue name + counts.
 */
import { createServer, type Server } from "node:http";
import type { Logger } from "pino";

export interface HealthCounters {
  processed: number;
  failed: number;
  dead: number;
  inFlight: number;
}

export interface HealthServerOptions {
  port: number;
  queueName: string;
  counters: HealthCounters;
  logger: Logger;
}

export interface HealthServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createHealthServer(opts: HealthServerOptions): HealthServer {
  const { port, queueName, counters, logger } = opts;
  const startedAt = Date.now();

  const server: Server = createServer((req, res) => {
    if (req.method !== "GET" || req.url !== "/health") {
      res.statusCode = 404;
      res.end();
      return;
    }
    const body = JSON.stringify({
      ok: true,
      queue: queueName,
      processed: counters.processed,
      failed: counters.failed,
      dead: counters.dead,
      inFlight: counters.inFlight,
      uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    });
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(body);
  });

  return {
    start() {
      return new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, () => {
          server.removeListener("error", reject);
          logger.info({ port, queue: queueName }, "health server listening");
          resolve();
        });
      });
    },
    stop() {
      return new Promise<void>((resolve) => {
        server.close(() => {
          logger.info("health server closed");
          resolve();
        });
      });
    },
  };
}
