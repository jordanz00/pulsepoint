/**
 * Transactional email — Resend (PulseCore)
 */

import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL ?? "PulseCore <onboarding@resend.dev>";
