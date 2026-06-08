import type { CampaignState } from "@prisma/client";
import {
  CAMPAIGN_TRANSITIONS,
  canTransition,
  type CampaignState as SharedCampaignState,
} from "@ams/shared";
import { prisma } from "../lib/prisma.js";
import { writeAudit } from "../lib/audit.js";

export async function transitionCampaign(
  campaignId: string,
  nextState: CampaignState,
  actorId?: string
) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { creatives: true, audienceLists: true },
  });

  const current = campaign.state as SharedCampaignState;
  const next = nextState as SharedCampaignState;

  if (!canTransition(current, next, CAMPAIGN_TRANSITIONS)) {
    const err = new Error(`Invalid transition ${current} → ${next}`);
    (err as Error & { code: string }).code = "AMS_VAL_003";
    throw err;
  }

  if (next === "READY_TO_TRAFFIC") {
    const readiness = await checkReadyToTraffic(campaignId);
    if (!readiness.ready) {
      const err = new Error(readiness.reasons.join("; "));
      (err as Error & { code: string }).code = "AMS_VAL_003";
      throw err;
    }
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: { state: nextState },
  });

  await writeAudit({
    entityType: "Campaign",
    entityId: campaignId,
    action: `state:${current}→${next}`,
    actorId,
    before: { state: current },
    after: { state: next },
  });

  return updated;
}

export async function checkReadyToTraffic(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: {
      creatives: true,
      audienceLists: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  const reasons: string[] = [];
  if (!campaign.audienceQaAt) reasons.push("Audience QA incomplete");
  if (!campaign.budgetQaAt) reasons.push("Budget QA incomplete");
  if (!campaign.creativeQaAt) reasons.push("Creative QA incomplete");

  const latestAudience = campaign.audienceLists[0];
  if (!latestAudience?.valid) reasons.push("NPI audience list not validated");

  const unlocked = campaign.creatives.filter((c) => c.state !== "LOCKED" && c.state !== "TRAFFICKED" && c.state !== "LIVE");
  if (unlocked.length > 0) reasons.push("All creatives must be LOCKED before traffic");

  return { ready: reasons.length === 0, reasons };
}

export async function markQaGate(
  campaignId: string,
  gate: "audience" | "budget" | "creative",
  actorId?: string
) {
  const data =
    gate === "audience"
      ? { audienceQaAt: new Date() }
      : gate === "budget"
        ? { budgetQaAt: new Date() }
        : { creativeQaAt: new Date() };

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data,
  });

  await writeAudit({
    entityType: "Campaign",
    entityId: campaignId,
    action: `qa_gate:${gate}`,
    actorId,
    after: data,
  });

  return updated;
}
