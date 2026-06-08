/**
 * Resend email adapter — primary for prototype + small pilots.
 */

import type { EmailAdapter, EmailSendResult, OutboundEmail } from "@/lib/adapters/types";
import { DEFAULT_FROM, getResend, isResendConfigured } from "@/lib/email";

export const resendEmailAdapter: EmailAdapter = {
  id: "resend",

  isConfigured() {
    return isResendConfigured();
  },

  async send(email: OutboundEmail): Promise<EmailSendResult> {
    const resend = getResend();
    const result = await resend.emails.send(
      {
        from: email.from ?? DEFAULT_FROM,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      },
      email.idempotencyKey ? { idempotencyKey: email.idempotencyKey } : undefined,
    );
    return {
      providerMessageId: result.data?.id ?? null,
      adapterId: "resend",
      status: "sent",
    };
  },
};
