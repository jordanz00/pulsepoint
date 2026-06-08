/** Metric definition registry — AMS reporting normalization layer */
export declare const METRIC_REGISTRY: readonly [{
    readonly key: "spend_usd";
    readonly label: "Spend (USD)";
    readonly owner: "ams_normalized";
    readonly timezone: "America/New_York";
    readonly includesFees: true;
    readonly pulsepointField: "ASSUMPTION: spend";
    readonly description: "Billable media spend including platform fees per finance definition.";
}, {
    readonly key: "impressions";
    readonly label: "Impressions";
    readonly owner: "pulsepoint";
    readonly timezone: "UTC";
    readonly includesFees: false;
    readonly pulsepointField: "ASSUMPTION: impressions";
    readonly description: "Delivered impressions from PulsePoint delivery report.";
}, {
    readonly key: "pacing_pct";
    readonly label: "Pacing %";
    readonly owner: "ams_computed";
    readonly timezone: "America/New_York";
    readonly includesFees: false;
    readonly pulsepointField: "ASSUMPTION: budget_pacing";
    readonly description: "Percent of budget consumed vs elapsed flight days.";
}];
export type MetricKey = (typeof METRIC_REGISTRY)[number]["key"];
