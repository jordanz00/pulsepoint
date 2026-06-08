import { createHash } from "node:crypto";
import type { CreativeState } from "@prisma/client";
import {
  CREATIVE_TRANSITIONS,
  canTransition,
  type CreativeState as SharedCreativeState,
} from "@ams/shared";
import { prisma } from "../lib/prisma.js";
import { writeAudit } from "../lib/audit.js";

export function hashCreativeContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function transitionCreative(
  creativeId: string,
  nextState: CreativeState,
  actorId?: string,
  opts?: { mlrApprovedBy?: string; contentForHash?: string }
) {
  const creative = await prisma.creative.findUniqueOrThrow({
    where: { id: creativeId },
  });

  const current = creative.state as SharedCreativeState;
  const next = nextState as SharedCreativeState;

  if (!canTransition(current, next, CREATIVE_TRANSITIONS)) {
    throw new Error(`Invalid creative transition ${current} → ${next}`);
  }

  const data: {
    state: CreativeState;
    mlrApprovedAt?: Date;
    mlrApprovedBy?: string;
    lockedAt?: Date;
    contentHash?: string;
    version?: number;
  } = { state: nextState };

  if (next === "MLR_APPROVED") {
    data.mlrApprovedAt = new Date();
    data.mlrApprovedBy = opts?.mlrApprovedBy ?? actorId ?? "system";
  }

  if (next === "LOCKED") {
    if (!opts?.contentForHash && !creative.contentHash) {
      throw new Error("Content hash required to lock creative");
    }
    data.lockedAt = new Date();
    data.contentHash = opts?.contentForHash
      ? hashCreativeContent(opts.contentForHash)
      : creative.contentHash!;
    data.version = creative.version + 1;
  }

  const updated = await prisma.creative.update({
    where: { id: creativeId },
    data,
  });

  await writeAudit({
    entityType: "Creative",
    entityId: creativeId,
    action: `state:${current}→${next}`,
    actorId,
    before: { state: current, version: creative.version },
    after: { state: next, version: updated.version, contentHash: updated.contentHash },
  });

  return updated;
}
