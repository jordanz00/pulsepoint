/** Operational error codes with human-readable remediation (no PHI in messages). */
export const ERROR_RUNBOOKS = {
    AMS_SYNC_001: {
        title: "PulsePoint sync failed",
        message: "Campaign could not be pushed to PulsePoint.",
        steps: [
            "Open Sync Queue and read the error detail.",
            "Confirm PulsePoint API credentials and campaign external ID.",
            "Fix validation errors on the campaign, set status back to Ready to Traffic, and retry.",
        ],
    },
    AMS_VAL_002: {
        title: "NPI list validation failed",
        message: "Audience file did not pass pre-flight checks.",
        steps: [
            "Download the validation report.",
            "Fix invalid NPIs, duplicates, or format issues.",
            "Upload a new suppression version and re-run validation.",
        ],
    },
    AMS_VAL_003: {
        title: "Not ready to traffic",
        message: "Required QA gates are incomplete.",
        steps: [
            "Complete Audience QA, Budget QA, and Creative/MLR QA.",
            "Ensure all creatives are LOCKED before trafficking.",
        ],
    },
    AMS_REC_004: {
        title: "Reporting discrepancy",
        message: "AMS normalized spend does not match PulsePoint pull.",
        steps: [
            "Open Explain the Delta on the campaign reporting tab.",
            "Check timezone and fee definitions in Metric Registry.",
            "File ops ticket if delta exceeds tolerance after definitions align.",
        ],
    },
    AMS_PERM_005: {
        title: "Permission denied",
        message: "Your role cannot perform this action on a live campaign.",
        steps: [
            "Request Ops Lead or Admin to perform the change.",
            "All live edits are audit-logged.",
        ],
    },
};
