/**
 * SMTP email adapter — vendor-agnostic fallback.
 *
 * Works with: AWS SES, Postmark, Mailgun, Sendgrid, enterprise SMTP relays,
 * Google Workspace SMTP, self-hosted Postfix. Configured purely via SMTP_*
 * env vars so PulsePoint never depends on a single email vendor.
 *
 * `nodemailer` is a real dependency so the fallback works out-of-the-box
 * the moment SMTP_* env vars are set — no separate install step.
 */

import nodemailer from "nodemailer";
import type { EmailAdapter, EmailSendResult, OutboundEmail } from "@/lib/adapters/types";

function smtpFrom(): string {
  return (
    process.env.SMTP_FROM_EMAIL ??
    process.env.RESEND_FROM_EMAIL ??
    "PulsePoint <noreply@pulsepoint.local>"
  );
}

export const smtpEmailAdapter: EmailAdapter = {
  id: "smtp",

  isConfigured() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);
  },

  async send(email: OutboundEmail): Promise<EmailSendResult> {
    if (!this.isConfigured()) {
      return { providerMessageId: null, adapterId: "smtp", status: "skipped" };
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    const result = await transporter.sendMail({
      from: email.from ?? smtpFrom(),
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    return {
      providerMessageId: result.messageId ?? null,
      adapterId: "smtp",
      status: "sent",
    };
  },
};
