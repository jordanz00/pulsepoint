export const ROLES = [
    "VIEWER",
    "TRAFFICKER",
    "MLR_REVIEWER",
    "OPS_LEAD",
    "ADMIN",
];
/** Action → minimum role */
export const PERMISSIONS = {
    "campaign:read": "VIEWER",
    "campaign:edit_draft": "TRAFFICKER",
    "campaign:transition_qa": "OPS_LEAD",
    "campaign:ready_to_traffic": "OPS_LEAD",
    "campaign:sync": "TRAFFICKER",
    "campaign:edit_live": "ADMIN",
    "creative:mlr_approve": "MLR_REVIEWER",
    "creative:lock": "OPS_LEAD",
    "audience:validate": "TRAFFICKER",
    "reconciliation:run": "OPS_LEAD",
    "audit:read": "VIEWER",
};
const ROLE_RANK = {
    VIEWER: 0,
    TRAFFICKER: 1,
    MLR_REVIEWER: 2,
    OPS_LEAD: 3,
    ADMIN: 4,
};
export function hasPermission(userRole, action) {
    const required = PERMISSIONS[action];
    if (!required)
        return false;
    return ROLE_RANK[userRole] >= ROLE_RANK[required];
}
