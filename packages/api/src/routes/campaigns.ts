/**
 * Campaign routes — CRUD + lifecycle + sync + reconciliation + pacing.
 *
 * WHO THIS IS FOR: trafficker / ops UI; orchestrator scripts.
 * WHAT IT DOES: Exposes /campaigns endpoints with zod-validated schemas
 *   (so OpenAPI docs are generated automatically) and explicit RBAC checks
 *   on every state-changing operation AND every read.
 * HOW IT CONNECTS: All handlers require req.actor (populated by plugins/auth).
 *   State changes flow into services/campaign-workflow.ts and write audit rows.
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma.js";
import { assertPermission } from "../lib/auth-context.js";
import {
  transitionCampaign,
  markQaGate,
  checkReadyToTraffic,
} from "../services/campaign-workflow.js";
import { enqueueSync } from "../services/sync-queue.js";
import { dispatchSyncJob } from "../queue/sync-queue-client.js";
import { validateAudienceUpload } from "../services/audience-validation.js";
import { runReconciliation, explainDelta } from "../services/reconciliation.js";
import { evaluatePacing } from "../services/pacing.js";
import { CAMPAIGN_STATES } from "@ams/shared";
import type { CampaignState } from "@prisma/client";

const idParams = z.object({ id: z.string().min(1) });

const createCampaignBody = z.object({
  name: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  budgetUsd: z.number().positive(),
  flightStart: z.string().min(1),
  flightEnd: z.string().min(1),
});

const transitionBody = z.object({
  state: z.enum(CAMPAIGN_STATES),
});

const qaGateParams = z.object({
  id: z.string().min(1),
  gate: z.enum(["audience", "budget", "creative"]),
});

const audienceBody = z.object({
  filename: z.string().min(1).max(255),
  lines: z.array(z.string().max(64)).max(50_000),
  suppressionVersion: z.string().max(64).optional(),
});

const reconcileBody = z.object({
  metricKey: z.string().min(1).max(64),
});

const reconcileParams = z.object({
  id: z.string().min(1),
  metricKey: z.string().min(1).max(64),
});

export async function campaignRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/campaigns",
    {
      schema: {
        tags: ["campaigns"],
        summary: "List campaigns (newest first).",
        response: {
          200: z.array(z.unknown()),
        },
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:read");
      return prisma.campaign.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { syncJobs: true, creatives: true } },
        },
      });
    },
  );

  r.get(
    "/campaigns/:id",
    {
      schema: {
        tags: ["campaigns"],
        summary: "Get a single campaign with recent lists, mappings, alerts.",
        params: idParams,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:read");
      return prisma.campaign.findUniqueOrThrow({
        where: { id: req.params.id },
        include: {
          creatives: true,
          audienceLists: { orderBy: { version: "desc" }, take: 5 },
          syncJobs: { orderBy: { createdAt: "desc" }, take: 10 },
          idMappings: true,
          pacingAlerts: {
            where: { acknowledged: false },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    },
  );

  r.post(
    "/campaigns",
    {
      schema: {
        tags: ["campaigns"],
        summary: "Create a draft campaign.",
        body: createCampaignBody,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:edit_draft");
      const body = req.body;
      return prisma.campaign.create({
        data: {
          name: body.name,
          clientName: body.clientName,
          budgetUsd: body.budgetUsd,
          flightStart: new Date(body.flightStart),
          flightEnd: new Date(body.flightEnd),
        },
      });
    },
  );

  r.post(
    "/campaigns/:id/transition",
    {
      schema: {
        tags: ["campaigns"],
        summary: "Transition campaign to a new lifecycle state.",
        params: idParams,
        body: transitionBody,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:transition_qa");
      return transitionCampaign(
        req.params.id,
        req.body.state as CampaignState,
        req.actor.id,
      );
    },
  );

  r.get(
    "/campaigns/:id/ready-check",
    {
      schema: {
        tags: ["campaigns"],
        summary: "Evaluate readiness to traffic.",
        params: idParams,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:read");
      return checkReadyToTraffic(req.params.id);
    },
  );

  r.post(
    "/campaigns/:id/qa/:gate",
    {
      schema: {
        tags: ["campaigns"],
        summary: "Mark a QA gate (audience | budget | creative) complete.",
        params: qaGateParams,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:transition_qa");
      return markQaGate(req.params.id, req.params.gate, req.actor.id);
    },
  );

  r.post(
    "/campaigns/:id/audience/validate",
    {
      // 5MB body limit applied at the route via custom bodyLimit
      bodyLimit: 5 * 1024 * 1024,
      schema: {
        tags: ["audience"],
        summary: "Validate an NPI audience list (Luhn + dedupe).",
        params: idParams,
        body: audienceBody,
      },
    },
    async (req) => {
      assertPermission(req.actor, "audience:validate");
      return validateAudienceUpload(
        req.params.id,
        req.body.filename,
        req.body.lines,
        req.body.suppressionVersion,
        req.actor.id,
      );
    },
  );

  r.post(
    "/campaigns/:id/sync",
    {
      schema: {
        tags: ["sync"],
        summary: "Enqueue a PulsePoint sync job for this campaign.",
        params: idParams,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:sync");
      const job = await enqueueSync(req.params.id, req.actor.id);
      const dispatch = await dispatchSyncJob(job.id);
      return { job, dispatch };
    },
  );

  r.post(
    "/campaigns/:id/reconcile",
    {
      schema: {
        tags: ["reconciliation"],
        summary: "Run reconciliation for a metric (AMS vs PulsePoint).",
        params: idParams,
        body: reconcileBody,
      },
    },
    async (req) => {
      assertPermission(req.actor, "reconciliation:run");
      return runReconciliation(
        req.params.id,
        req.body.metricKey,
        req.actor.id,
      );
    },
  );

  r.get(
    "/campaigns/:id/reconcile/:metricKey",
    {
      schema: {
        tags: ["reconciliation"],
        summary: "Explain the latest reconciliation delta for a metric.",
        params: reconcileParams,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:read");
      return explainDelta(req.params.id, req.params.metricKey);
    },
  );

  r.post(
    "/campaigns/:id/pacing/evaluate",
    {
      schema: {
        tags: ["pacing"],
        summary: "Evaluate pacing & raise alerts when thresholds tripped.",
        params: idParams,
      },
    },
    async (req) => {
      assertPermission(req.actor, "pacing:run");
      return evaluatePacing(req.params.id);
    },
  );
}

