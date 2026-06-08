/**
 * System routes — health, reference data, audit, onboarding.
 *
 * WHO THIS IS FOR: ops dashboards (sync queue, audit), reference UI
 *   (runbooks, metric registry), and uptime probes (/health).
 * WHAT IT DOES: Read-only endpoints. /health and /runbooks* and
 *   /metrics/registry are public reference; /audit and /sync/jobs and
 *   /onboarding/checklist require auth + permissions.
 * HOW IT CONNECTS: Reads Prisma + the in-process @ams/shared constants.
 *
 * NOTE: Public reference routes (runbooks, metric registry, health) skip
 *   auth via the prefix list in plugins/auth.ts — except runbooks/metrics
 *   which are still passed through auth (any authenticated viewer sees
 *   them; we explicitly do NOT add /runbooks or /metrics to public
 *   prefixes to keep blast radius small).
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ERROR_RUNBOOKS, METRIC_REGISTRY } from "@ams/shared";
import { prisma } from "../lib/prisma.js";
import { assertPermission } from "../lib/auth-context.js";

const runbookParams = z.object({ code: z.string().min(1).max(64) });
const auditQuery = z.object({
  entityType: z.string().max(64).optional(),
  entityId: z.string().max(64).optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .optional(),
});

export async function systemRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        summary: "Liveness probe.",
        response: {
          200: z.object({ ok: z.boolean(), service: z.string() }),
        },
      },
    },
    async () => ({ ok: true, service: "pulsepoint-ams-api" }),
  );

  r.get(
    "/runbooks",
    {
      schema: {
        tags: ["system"],
        summary: "List operational error runbooks (public reference).",
      },
    },
    async () => ERROR_RUNBOOKS,
  );

  r.get(
    "/runbooks/:code",
    {
      schema: {
        tags: ["system"],
        summary: "Fetch a single runbook (db fallback to static).",
        params: runbookParams,
      },
    },
    async (req) => {
      const code = req.params.code;
      const db = await prisma.errorRunbook.findUnique({ where: { code } });
      if (db) {
        return { title: db.title, message: db.message, steps: db.steps };
      }
      return ERROR_RUNBOOKS[code] ?? null;
    },
  );

  r.get(
    "/metrics/registry",
    {
      schema: {
        tags: ["system"],
        summary: "Metric registry (db override falls back to static).",
      },
    },
    async () => {
      const db = await prisma.metricDefinition.findMany();
      return db.length ? db : METRIC_REGISTRY;
    },
  );

  r.get(
    "/audit",
    {
      schema: {
        tags: ["audit"],
        summary: "List audit log rows filtered by entity (capped at 100).",
        querystring: auditQuery,
      },
    },
    async (req) => {
      assertPermission(req.actor, "audit:read");
      const limit = Math.min(100, parseInt(req.query.limit ?? "50", 10));
      return prisma.auditLog.findMany({
        where: {
          entityType: req.query.entityType,
          entityId: req.query.entityId,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { actor: { select: { email: true, name: true } } },
      });
    },
  );

  r.get(
    "/sync/jobs",
    {
      schema: {
        tags: ["sync"],
        summary: "List recent sync jobs (newest first, capped at 50).",
      },
    },
    async (req) => {
      assertPermission(req.actor, "sync:read");
      return prisma.syncJob.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          campaign: { select: { name: true, amsUuid: true } },
        },
      });
    },
  );

  r.get(
    "/onboarding/checklist",
    {
      schema: {
        tags: ["system"],
        summary: "Static onboarding checklist for a new campaign.",
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:read");
      return {
        title: "Campaign launch checklist",
        steps: [
          { id: 1, label: "Create campaign brief in AMS", state: "intake" },
          {
            id: 2,
            label: "Upload & validate NPI audience list",
            state: "audience_qa",
          },
          { id: 3, label: "Complete budget QA", state: "budget_qa" },
          {
            id: 4,
            label: "Submit creatives → MLR approve → LOCK",
            state: "creative_mlr",
          },
          {
            id: 5,
            label: "Mark Ready to Traffic (all gates green)",
            state: "ready",
          },
          {
            id: 6,
            label: "Enqueue sync → verify PulsePoint ID",
            state: "sync",
          },
          {
            id: 7,
            label: "Confirm live + monitor pacing alerts",
            state: "live",
          },
          { id: 8, label: "Run reporting reconciliation", state: "reconcile" },
        ],
      };
    },
  );
}
