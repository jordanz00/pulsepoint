/** Campaign workflow — AMS system of record */
export const CAMPAIGN_STATES = [
  "DRAFT",
  "QA",
  "APPROVED",
  "READY_TO_TRAFFIC",
  "SYNCED",
  "LIVE",
  "OPTIMIZING",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type CampaignState = (typeof CAMPAIGN_STATES)[number];

export const CAMPAIGN_TRANSITIONS: Record<CampaignState, CampaignState[]> = {
  DRAFT: ["QA", "ARCHIVED"],
  QA: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["QA", "READY_TO_TRAFFIC", "ARCHIVED"],
  READY_TO_TRAFFIC: ["APPROVED", "SYNCED", "ARCHIVED"],
  SYNCED: ["READY_TO_TRAFFIC", "LIVE", "ARCHIVED"],
  LIVE: ["OPTIMIZING", "COMPLETED", "ARCHIVED"],
  OPTIMIZING: ["LIVE", "COMPLETED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

/** Creative / MLR workflow */
export const CREATIVE_STATES = [
  "DRAFT",
  "SUBMITTED",
  "MLR_APPROVED",
  "LOCKED",
  "TRAFFICKED",
  "LIVE",
  "RETIRED",
] as const;

export type CreativeState = (typeof CREATIVE_STATES)[number];

export const CREATIVE_TRANSITIONS: Record<CreativeState, CreativeState[]> = {
  DRAFT: ["SUBMITTED", "RETIRED"],
  SUBMITTED: ["DRAFT", "MLR_APPROVED", "RETIRED"],
  MLR_APPROVED: ["SUBMITTED", "LOCKED", "RETIRED"],
  LOCKED: ["MLR_APPROVED", "TRAFFICKED", "RETIRED"],
  TRAFFICKED: ["LOCKED", "LIVE", "RETIRED"],
  LIVE: ["RETIRED"],
  RETIRED: [],
};

export function canTransition<T extends string>(
  current: T,
  next: T,
  map: Record<string, T[]>
): boolean {
  return (map[current] ?? []).includes(next);
}
