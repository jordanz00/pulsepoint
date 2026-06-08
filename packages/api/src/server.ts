/**
 * AMS API server entrypoint.
 *
 * WHO THIS IS FOR: production process + integration tests (via buildApp()).
 * WHAT IT DOES:
 *   1. Initializes telemetry FIRST (so auto-instrumentations can wrap modules).
 *   2. Loads + validates env (fail-fast).
 *   3. Builds a Fastify app with helmet → cors → rate-limit → swagger → auth → routes.
 *   4. Registers a unified error handler that maps known errors and never leaks stacks in prod.
 *   5. Wires graceful shutdown on SIGTERM / SIGINT.
 *
 * HOW IT CONNECTS: Plugins set on Fastify decorate every request; routes
 *   import assertPermission() and req.actor (typed via plugins/auth.ts).
 *
 * SECURITY: Per SECURE-FORCE.md — strict CORS in prod, helmet defaults,
 *   rate limit, body limit, suppressed error detail in prod, no secrets
 *   logged. Telemetry init is wrapped in try/catch (lib/telemetry.ts) so
 *   observability failure does not block boot.
 */

import "dotenv/config";

import { initTelemetry } from "./lib/telemetry.js";

// Initialize telemetry BEFORE importing instrumented modules.
const telemetry = await initTelemetry();

import Fastify, {
  type FastifyInstance,
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { getEnv, loadEnv } from "./lib/env.js";
import { authPlugin } from "./plugins/auth.js";
import { campaignRoutes } from "./routes/campaigns.js";
import { creativeRoutes } from "./routes/creatives.js";
import { systemRoutes } from "./routes/system.js";
import { AmsError } from "./lib/errors.js";
import { prisma } from "./lib/prisma.js";

// Load + validate env at boot — throws clearly if anything is missing.
const env = loadEnv();

/**
 * Build a Fastify instance with all plugins + routes wired.
 *
 * WHO THIS IS FOR: server bootstrap below + integration tests that want
 *   a fresh app per suite.
 * WHAT IT DOES: Composes plugins in the documented order. Does NOT call
 *   .listen() — callers do that themselves.
 *
 * @returns ready-to-listen Fastify instance
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.isProduction
      ? { level: env.logLevel }
      : {
          level: env.logLevel,
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
          },
        },
    genReqId: () => globalThis.crypto.randomUUID(),
    bodyLimit: 1024 * 1024, // 1 MB default; route-level override on /audience/validate
    ajv: { customOptions: { coerceTypes: false } },
    trustProxy: env.isProduction,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 1. Hardening
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // swagger-ui needs inline styles
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  });

  // 2. CORS — strict in prod
  await app.register(cors, {
    origin: env.isProduction ? [env.webOrigin] : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  // 3. Rate limit
  await app.register(rateLimit, {
    global: true,
    max: env.rateLimitMax,
    timeWindow: env.rateLimitWindowMs,
    allowList: (req) => req.url.startsWith("/health"),
    keyGenerator: (req) => req.actor?.id ?? req.ip,
  });

  // 4. Typed errors + swagger
  await app.register(sensible);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "PulsePoint AMS API",
        description: "Internal API for campaign trafficking, MLR, sync, reconciliation.",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  });
  app.get("/openapi.json", { schema: { hide: true } }, () => app.swagger());

  // 5. Auth (decorates req.actor, populates on preHandler)
  await app.register(authPlugin);

  // 6. Routes
  await app.register(systemRoutes);
  await app.register(campaignRoutes);
  await app.register(creativeRoutes);

  // 7. Error handler — last
  app.setErrorHandler((err, req, reply) => mapError(err, req, reply));
  app.setNotFoundHandler((req, reply) => {
    reply.status(404).send({
      error: { code: "AMS_NOT_FOUND", message: "Route not found", requestId: req.id },
    });
  });

  return app;
}

/**
 * Map any thrown error into the standard JSON envelope.
 *
 * WHO THIS IS FOR: server.setErrorHandler.
 * WHAT IT DOES: Recognizes AmsError, ZodError, Prisma not-found (P2025),
 *   Fastify validation errors, rate-limit 429s, and legacy "code" property
 *   errors. Logs full detail server-side; returns sanitized message client-side.
 */
function mapError(
  err: FastifyError | Error,
  req: FastifyRequest,
  reply: FastifyReply,
): FastifyReply {
  const env = getEnv();
  const requestId = req.id;

  // 1. AmsError (typed)
  if (err instanceof AmsError) {
    req.log.warn({ code: err.code, status: err.status, details: err.details });
    return reply.status(err.status).send({
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
  }

  // 2. ZodError
  if (err instanceof ZodError) {
    req.log.warn({ issues: err.issues }, "Schema validation failed");
    return reply.status(400).send({
      error: {
        code: "AMS_VALIDATION",
        message: "Invalid request payload",
        requestId,
        issues: env.isProduction ? undefined : err.issues,
      },
    });
  }

  // 3. Prisma not-found
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return reply.status(404).send({
      error: {
        code: "AMS_NOT_FOUND",
        message: "Resource not found",
        requestId,
      },
    });
  }

  // 4. Fastify validation (when schema fails before handler runs)
  if ("validation" in err && (err as FastifyError).validation) {
    req.log.warn(
      { validation: (err as FastifyError).validation },
      "Fastify validation failed",
    );
    return reply.status(400).send({
      error: {
        code: "AMS_VALIDATION",
        message: "Invalid request payload",
        requestId,
      },
    });
  }

  // 5. Rate limit
  if ("statusCode" in err && (err as FastifyError).statusCode === 429) {
    return reply.status(429).send({
      error: {
        code: "AMS_RATE_LIMIT",
        message: "Too many requests",
        requestId,
      },
    });
  }

  // 6. Legacy code property
  const legacyCode =
    "code" in err && typeof (err as Error & { code?: unknown }).code === "string"
      ? (err as Error & { code: string }).code
      : undefined;
  if (legacyCode) {
    const status =
      legacyCode === "AMS_PERM_005"
        ? 403
        : legacyCode === "AMS_AUTH_001"
          ? 401
          : 400;
    req.log.warn({ code: legacyCode }, err.message);
    return reply.status(status).send({
      error: { code: legacyCode, message: err.message, requestId },
    });
  }

  // 7. Unknown — log full, return generic
  req.log.error({ err }, "Unhandled error");
  return reply.status(500).send({
    error: {
      code: "AMS_INTERNAL",
      message: env.isProduction ? "Internal server error" : err.message,
      requestId,
    },
  });
}

const app = await buildApp();

app.log.info(
  { telemetryMode: telemetry.mode, port: env.port, authMode: env.authMode },
  "AMS API starting",
);

await app.listen({ port: env.port, host: "0.0.0.0" });

let shuttingDown = false;

/**
 * Drain Fastify, close Prisma + queue, flush telemetry.
 *
 * WHO THIS IS FOR: SIGTERM / SIGINT handlers (and tests that import buildApp).
 * WHAT IT DOES: Idempotent shutdown; logs a clear message; exits non-zero
 *   if any step throws so the orchestrator (k8s, ECS) can mark unhealthy.
 *
 * @param signal name of triggering signal (logged only)
 */
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, "Graceful shutdown begin");

  let exitCode = 0;
  try {
    await app.close();
  } catch (e) {
    app.log.error({ err: e }, "Fastify close failed");
    exitCode = 1;
  }
  try {
    await prisma.$disconnect();
  } catch (e) {
    app.log.error({ err: e }, "Prisma disconnect failed");
    exitCode = 1;
  }
  try {
    const { closeSyncQueue } = await import("./queue/sync-queue-client.js");
    await closeSyncQueue();
  } catch (e) {
    app.log.error({ err: e }, "Queue close failed");
    exitCode = 1;
  }
  try {
    await telemetry.shutdown();
  } catch (e) {
    app.log.error({ err: e }, "Telemetry shutdown failed");
    exitCode = 1;
  }

  app.log.info({ exitCode }, "Graceful shutdown done");
  process.exit(exitCode);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
