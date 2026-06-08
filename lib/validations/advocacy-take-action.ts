/**
 * Public advocacy take-action form — no PHI; hospital executive / GR contact fields.
 */

import { z } from "zod";

export const advocacyTakeActionInputSchema = z.object({
  responderName: z.string().trim().min(2).max(120),
  responderEmail: z.string().trim().email().max(254),
  responderTitle: z.string().trim().max(120).optional().or(z.literal("")),
  hospitalName: z.string().trim().min(2).max(200),
  memberOrganizationId: z.string().cuid().optional().or(z.literal("")),
  position: z.enum(["SUPPORT", "OPPOSE", "NEUTRAL"]).default("SUPPORT"),
});

export type AdvocacyTakeActionInput = z.infer<typeof advocacyTakeActionInputSchema>;
