/** Campaign workflow — AMS system of record */
export declare const CAMPAIGN_STATES: readonly ["DRAFT", "QA", "APPROVED", "READY_TO_TRAFFIC", "SYNCED", "LIVE", "OPTIMIZING", "COMPLETED", "ARCHIVED"];
export type CampaignState = (typeof CAMPAIGN_STATES)[number];
export declare const CAMPAIGN_TRANSITIONS: Record<CampaignState, CampaignState[]>;
/** Creative / MLR workflow */
export declare const CREATIVE_STATES: readonly ["DRAFT", "SUBMITTED", "MLR_APPROVED", "LOCKED", "TRAFFICKED", "LIVE", "RETIRED"];
export type CreativeState = (typeof CREATIVE_STATES)[number];
export declare const CREATIVE_TRANSITIONS: Record<CreativeState, CreativeState[]>;
export declare function canTransition<T extends string>(current: T, next: T, map: Record<string, T[]>): boolean;
