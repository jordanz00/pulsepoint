/**
 * Webhook metadata trust — never apply Stripe metadata without DB verification.
 */

import type { EventRegistration } from "@/app/generated/prisma/client";

export type StripeRegistrationMetadata = {
  registrationId?: string | null;
  orgId?: string | null;
  eventId?: string | null;
};

/**
 * Returns false if metadata does not match the registration row (possible forgery).
 */
export function metadataMatchesRegistration(
  reg: Pick<EventRegistration, "id" | "orgId" | "eventId">,
  metadata: StripeRegistrationMetadata,
): boolean {
  if (metadata.registrationId && metadata.registrationId !== reg.id) {
    return false;
  }
  if (metadata.orgId && metadata.orgId !== reg.orgId) {
    return false;
  }
  if (metadata.eventId && metadata.eventId !== reg.eventId) {
    return false;
  }
  return true;
}
