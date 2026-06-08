export declare const ROLES: readonly ["VIEWER", "TRAFFICKER", "MLR_REVIEWER", "OPS_LEAD", "ADMIN"];
export type Role = (typeof ROLES)[number];
/** Action → minimum role */
export declare const PERMISSIONS: Record<string, Role>;
export declare function hasPermission(userRole: Role, action: string): boolean;
