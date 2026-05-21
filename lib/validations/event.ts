import { z } from "zod";

export const eventStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
]);

export const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  priceCents: z.coerce.number().int().min(0).max(10_000_000).optional(),
  status: eventStatusSchema.optional(),
  publicSlug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export type EventInput = z.infer<typeof eventInputSchema>;

export const publicRegistrationSchema = z.object({
  guestName: z.string().trim().min(1).max(200),
  guestEmail: z.string().email().max(254),
});
