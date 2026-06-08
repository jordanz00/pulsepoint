import { z } from "zod";

export const memberNoteInputSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  noteType: z.enum(["RELATIONSHIP", "FOLLOW_UP", "GENERAL"]).optional(),
  channel: z.string().trim().max(40).optional().or(z.literal("")),
  nextFollowUpAt: z.string().datetime().optional().or(z.literal("")),
});
