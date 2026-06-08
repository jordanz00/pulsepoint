/**
 * Email resolver. Failover order:
 *   EMAIL_ADAPTER env override → Resend → SMTP → log-only.
 *
 * The chain ensures registration confirmations attempt every available channel
 * and never block on email failure (registration stays authoritative).
 */

import type { EmailAdapter, EmailSendResult, OutboundEmail } from "@/lib/adapters/types";
import { logEmailAdapter } from "@/lib/adapters/email/log";
import { resendEmailAdapter } from "@/lib/adapters/email/resend";
import { smtpEmailAdapter } from "@/lib/adapters/email/smtp";

const ALL: EmailAdapter[] = [resendEmailAdapter, smtpEmailAdapter, logEmailAdapter];

export function getActiveEmailAdapters(): EmailAdapter[] {
  const override = (process.env.EMAIL_ADAPTER ?? "").toLowerCase();
  if (override) {
    const picked = ALL.find((a) => a.id === override && a.isConfigured());
    if (picked) return [picked, logEmailAdapter];
  }
  return ALL.filter((a) => a.isConfigured());
}

/** Tries each configured adapter in order; first non-skipped result wins. */
export async function sendEmailWithFailover(email: OutboundEmail): Promise<EmailSendResult> {
  if (process.env.PULSE_DRILL_EMAIL_FAIL === "true") {
    throw new Error("DRILL: simulated email provider failure (PULSE_DRILL_EMAIL_FAIL)");
  }
  const chain = getActiveEmailAdapters();
  let last: EmailSendResult = { providerMessageId: null, adapterId: "log", status: "skipped" };
  for (const adapter of chain) {
    try {
      const result = await adapter.send(email);
      if (result.status !== "skipped") return result;
      last = result;
    } catch (err) {
      console.error(`[email:${adapter.id}] failed: ${(err as Error).message}`);
      last = { providerMessageId: null, adapterId: adapter.id, status: "skipped" };
    }
  }
  return last;
}
