import { z } from "zod";

export const memberNoteInputSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});
