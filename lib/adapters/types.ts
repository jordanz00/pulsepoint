/**
 * Vendor adapter types — PulsePoint portability layer.
 *
 * WHO THIS IS FOR: Anyone swapping a vendor (Stripe → Square, Resend → SES,
 * Clerk → Entra, Vercel → Fly.io). The contracts here are the only thing
 * application code touches; concrete vendor SDKs hide behind these interfaces.
 *
 * WHY: PulsePoint is built so no single vendor failure can sink the platform.
 * If one provider dies, raises prices, or is acquired, you ship a new file
 * implementing the same interface and flip an env var.
 *
 * See docs/VENDOR-PORTABILITY.md for the per-layer fallback matrix.
 */

import type { OrgRole } from "@/app/generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export type AuthSession = {
  userId: string;
  email: string | null;
  /** Provider-side org id, if the provider models orgs (Clerk, Entra). */
  providerOrgId?: string | null;
  /** Provider-side role, if available. PulsePoint maps this to OrgMembership.role. */
  providerRole?: OrgRole | null;
};

export interface AuthAdapter {
  readonly id: string;
  /** Returns the current session or null. Must be safe to call in RSC + server actions. */
  getSession(): Promise<AuthSession | null>;
  /** Path to send the user to sign in (e.g. "/sign-in" or "/demo"). */
  signInPath(): string;
  /** True when adapter has the env config it needs to run. */
  isConfigured(): boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

export type CheckoutLineItem = {
  /** Stable product id from PulsePoint domain (commerceProductId, eventId, etc.) */
  productRef: string;
  /** Display name on receipt / checkout */
  name: string;
  amountCents: number;
  currency: string;
  quantity: number;
};

export type CheckoutRequest = {
  orgId: string;
  /** Free-form id PulsePoint owns (registrationId, orderId, gift id) */
  ourReference: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  items: CheckoutLineItem[];
  /** Idempotency key for retry safety. */
  idempotencyKey: string;
};

export type CheckoutResponse = {
  /** Provider session/intent id (e.g. Stripe cs_...). */
  providerCheckoutId: string;
  /** URL to redirect customer to. Manual provider returns instructions instead. */
  redirectUrl: string | null;
};

export type PaymentEvent = {
  /** Provider event id; used for webhook idempotency. */
  providerEventId: string;
  type: "checkout.completed" | "payment.refunded" | "payment.failed";
  ourReference: string;
  amountCents: number;
  currency: string;
};

export interface PaymentAdapter {
  readonly id: string;
  /** Returns true when env is set; manual adapter is always true. */
  isConfigured(): boolean;
  startCheckout(req: CheckoutRequest): Promise<CheckoutResponse>;
  /** Verifies provider webhook signature and parses to a normalized event. */
  parseWebhook(rawBody: string, headers: Record<string, string>): Promise<PaymentEvent>;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL
// ─────────────────────────────────────────────────────────────────────────────

export type OutboundEmail = {
  to: string;
  subject: string;
  /** Plain text fallback (always required for compliance). */
  text: string;
  /** Optional HTML body. */
  html?: string;
  /** From override; defaults to provider DEFAULT_FROM. */
  from?: string;
  /** Used as Idempotency-Key on providers that support it (Resend). */
  idempotencyKey?: string;
};

export type EmailSendResult = {
  /** Provider message id when available. */
  providerMessageId: string | null;
  /** Adapter id that produced the result; useful for audit log. */
  adapterId: string;
  /** "queued" if the adapter only queued (e.g. SMTP behind a relay). */
  status: "sent" | "queued" | "skipped";
};

export interface EmailAdapter {
  readonly id: string;
  isConfigured(): boolean;
  send(email: OutboundEmail): Promise<EmailSendResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE (file uploads — exports, certificates, member avatars)
// ─────────────────────────────────────────────────────────────────────────────

export type StoragePutRequest = {
  orgId: string;
  /** Logical key (e.g. "exports/members-2026-05.csv") — adapter prefixes with org scope. */
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
};

export type StoragePutResult = {
  /** Internal storage URI (s3://, file://) — never expose directly to clients. */
  uri: string;
  /** Optional time-limited public URL when adapter supports it. */
  publicUrl: string | null;
};

export interface StorageAdapter {
  readonly id: string;
  isConfigured(): boolean;
  put(req: StoragePutRequest): Promise<StoragePutResult>;
  /** Returns presigned URL or local file URL with TTL hint. */
  signedUrl(uri: string, ttlSeconds: number): Promise<string>;
}

