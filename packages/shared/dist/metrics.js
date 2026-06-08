/** Metric definition registry — AMS reporting normalization layer */
export const METRIC_REGISTRY = [
    {
        key: "spend_usd",
        label: "Spend (USD)",
        owner: "ams_normalized",
        timezone: "America/New_York",
        includesFees: true,
        pulsepointField: "ASSUMPTION: spend",
        description: "Billable media spend including platform fees per finance definition.",
    },
    {
        key: "impressions",
        label: "Impressions",
        owner: "pulsepoint",
        timezone: "UTC",
        includesFees: false,
        pulsepointField: "ASSUMPTION: impressions",
        description: "Delivered impressions from PulsePoint delivery report.",
    },
    {
        key: "pacing_pct",
        label: "Pacing %",
        owner: "ams_computed",
        timezone: "America/New_York",
        includesFees: false,
        pulsepointField: "ASSUMPTION: budget_pacing",
        description: "Percent of budget consumed vs elapsed flight days.",
    },
];
