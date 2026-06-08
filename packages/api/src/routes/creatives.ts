/**
 * Creative routes — MLR lifecycle for a campaign's creatives.
 *
 * WHO THIS IS FOR: MLR reviewers + ops UI.
 * WHAT IT DOES: Create creatives + drive them through the state machine
 *   DRAFT → SUBMITTED → MLR_APPROVED → LOCKED → TRAFFICKED → LIVE → RETIRED.
 *   Each transition enforces the corresponding permission (mlr_approve,
 *   lock, traffic, go_live, retire).
 * HOW IT CONNECTS: Backed by services/creative-workflow.ts; writes audit rows
 *   via that service.
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma.js";
import { assertPermission } from "../lib/auth-context.js";
import { transitionCreative } from "../services/creative-workflow.js";
import { CREATIVE_STATES } from "@ams/shared";
import type { CreativeState } from "@prisma/client";

const campaignIdParams = z.object({ campaignId: z.string().min(1) });
const creativeIdParams = z.object({ id: z.string().min(1) });

const createBody = z.object({
  name: z.string().min(1).max(200),
});

const transitionBody = z.object({
  state: z.enum(CREATIVE_STATES),
  contentForHash: z.string().max(50_000).optional(),
});

/**
 * Map a target creative state to the required permission key.
 *
 * @param target target CreativeState
 * @returns permission key (from shared roles.PERMISSIONS)
 */
function permissionFor(target: CreativeState): string {
  switch (target) {
    case "MLR_APPROVED":
      return "creative:mlr_approve";
    case "LOCKED":
      return "creative:lock";
    case "TRAFFICKED":
      return "creative:traffic";
    case "LIVE":
      return "creative:go_live";
    case "RETIRED":
      return "creative:retire";
    default:
      // DRAFT / SUBMITTED — same as draft editing
      return "campaign:edit_draft";
  }
}

export async function creativeRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post(
    "/campaigns/:campaignId/creatives",
    {
      schema: {
        tags: ["creatives"],
        summary: "Create a draft creative under a campaign.",
        params: campaignIdParams,
        body: createBody,
      },
    },
    async (req) => {
      assertPermission(req.actor, "campaign:edit_draft");
      return prisma.creative.create({
        data: {
          campaignId: req.params.campaignId,
          name: req.body.name,
        },
      });
    },
  );

  r.post(
    "/creatives/:id/transition",
    {
      schema: {
        tags: ["creatives"],
        summary: "Transition a creative to a new MLR-lifecycle state.",
        params: creativeIdParams,
        body: transitionBody,
      },
    },
    async (req) => {
      const target = req.body.state as CreativeState;
      assertPermission(req.actor, permissionFor(target));
      return transitionCreative(req.params.id, target, req.actor.id, {
        mlrApprovedBy: req.actor.id,
        contentForHash: req.body.contentForHash,
      });
    },
  );
}
