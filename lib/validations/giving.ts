import { z } from "zod";

export const campaignInputSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional().default(""),
  goalDollars: z.coerce.number().min(0).max(10_000_000).optional(),
  goalCents: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).default("DRAFT"),
});

export const campaignUpdateSchema = campaignInputSchema.partial().extend({
  id: z.string().min(1).max(64),
});

export const staffDonationInputSchema = z.object({
  campaignId: z.string().min(1).max(64),
  memberId: z.string().min(1).max(64).optional(),
  donorName: z.string().min(1).max(200),
  donorEmail: z.string().email().optional().or(z.literal("")),
  amountDollars: z.coerce.number().min(1).max(1_000_000),
  recurring: z.coerce.boolean().default(false),
});

export const publicDonationInputSchema = z.object({
  campaignId: z.string().min(1).max(64),
  donorName: z.string().min(1).max(200),
  donorEmail: z.string().email().max(254),
  amountDollars: z.coerce.number().min(1).max(100_000),
});

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
