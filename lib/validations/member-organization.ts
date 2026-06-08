import { z } from "zod";

export const memberOrganizationTypeSchema = z.enum([
  "HEALTH_NETWORK",
  "HEALTH_SYSTEM",
  "HOSPITAL",
  "CRITICAL_ACCESS",
  "CANCER_CENTER",
  "PSYCHIATRIC_CENTER",
  "PSYCHIATRIC_INSTITUTE",
  "BEHAVIORAL_HEALTH_CENTER",
  "REHABILITATION_CENTER",
  "SPECIALTY",
  "PARTNER",
  "VENDOR",
  "OTHER",
]);

export const memberOwnershipTypeSchema = z.enum([
  "NONPROFIT",
  "FOR_PROFIT",
  "GOVERNMENT",
  "OTHER",
]);

export const memberOrganizationInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: memberOrganizationTypeSchema,
  parentId: z.string().trim().max(64).optional().or(z.literal("")),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  bedCount: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100000)])
    .optional(),
  ownership: memberOwnershipTypeSchema.optional().or(z.literal("")),
  membershipLevel: z.string().trim().max(80).optional().or(z.literal("")),
  participationLevel: z.string().trim().max(80).optional().or(z.literal("")),
});

export type MemberOrganizationInput = z.infer<typeof memberOrganizationInputSchema>;
