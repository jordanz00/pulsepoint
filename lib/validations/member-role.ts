/**
 * Zod schemas for member leadership / governance roles.
 */

import { z } from "zod";

export const leadershipLevelSchema = z.enum([
  "C_SUITE",
  "SENIOR_EXECUTIVE",
  "DIRECTOR",
  "MANAGER",
  "PROFESSIONAL",
  "OTHER",
]);

export const memberRoleScopeSchema = z.enum([
  "THIS_ASSOCIATION",
  "EXTERNAL_ORGANIZATION",
]);

export const memberRoleCategorySchema = z.enum([
  "EXECUTIVE",
  "BOARD",
  "COMMITTEE",
  "CHAPTER",
  "STAFF",
  "OTHER",
]);

export const memberRoleInputSchema = z.object({
  category: memberRoleCategorySchema,
  scope: memberRoleScopeSchema,
  leadershipLevel: leadershipLevelSchema.optional().nullable(),
  title: z.string().trim().min(1).max(120),
  organizationName: z.string().trim().max(200).optional().or(z.literal("")),
  isCurrent: z.boolean().optional(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type MemberRoleInput = z.infer<typeof memberRoleInputSchema>;
