import { prisma } from "@/lib/prisma";

/**
 * Returns true if this event was already processed (caller should skip).
 */
export async function claimWebhookEvent(
  id: string,
  source: "clerk" | "stripe",
): Promise<boolean> {
  const key = `${source}:${id}`;
  try {
    await prisma.webhookIdempotency.create({
      data: { id: key, source },
    });
    return false;
  } catch {
    return true;
  }
}
