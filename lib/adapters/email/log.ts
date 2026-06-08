/**
 * Log-only email adapter — last-resort fallback.
 *
 * Writes to the AutomationException queue so staff can see what would have
 * been sent if all email vendors are down. Never throws so registration paths
 * keep succeeding (registration is authoritative; email is soft-fail).
 */

import type { EmailAdapter, EmailSendResult, OutboundEmail } from "@/lib/adapters/types";

export const logEmailAdapter: EmailAdapter = {
  id: "log",

  isConfigured() {
    return true;
  },

  async send(email: OutboundEmail): Promise<EmailSendResult> {
    // Keep this side-effect-free at the adapter layer; the caller wraps in
    // recordAutomationException when a failure happens.
    console.warn(
      `[email:log] would have sent to=${email.to} subject="${email.subject}" key=${email.idempotencyKey ?? "-"}`,
    );
    return { providerMessageId: null, adapterId: "log", status: "queued" };
  },
};
