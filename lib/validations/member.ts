import { z } from "zod";

export const memberStatusSchema = z.enum(["ACTIVE", "INACTIVE", "LAPSED"]);

export const memberInputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  status: memberStatusSchema.optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type MemberInput = z.infer<typeof memberInputSchema>;

export const memberSearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: memberStatusSchema.optional(),
});
