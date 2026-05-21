/**
 * Stripe webhook — mark paid event registrations (idempotent)
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { recordAutomationException } from "@/lib/automation-exception";
import { claimWebhookEvent } from "@/lib/webhook-idempotency";
import { metadataMatchesRegistration } from "@/lib/webhook-trust";
import { assertRegistrationTransition } from "@/lib/registration-state";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (await claimWebhookEvent(event.id, "stripe")) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const registrationId = session.metadata?.registrationId;
    const orgId = session.metadata?.orgId;

    if (registrationId && orgId) {
      const db = getOrgDb(orgId);
      try {
        const reg = await db.eventRegistration.findFirst({
          where: { id: registrationId },
        });
        if (!reg) {
          await recordAutomationException({
            orgId,
            workflow: "stripe.checkout.completed",
            step: "registration.lookup",
            outcome: "PARTIAL_SUCCESS",
            message: "Stripe paid but registration row missing",
            context: { registrationId, sessionId: session.id },
          });
          return NextResponse.json({ ok: true, partial: true });
        }

        if (
          !metadataMatchesRegistration(reg, {
            registrationId,
            orgId,
            eventId: session.metadata?.eventId,
          })
        ) {
          await recordAutomationException({
            orgId: reg.orgId,
            workflow: "stripe.checkout.completed",
            step: "metadata.verify",
            outcome: "FAILED",
            message: "Stripe metadata does not match registration row",
            context: {
              registrationId,
              sessionId: session.id,
              metadataOrgId: orgId,
            },
          });
          return NextResponse.json({ error: "Metadata mismatch" }, { status: 400 });
        }

        assertRegistrationTransition(reg.status, "CONFIRMED");

        await db.eventRegistration.update({
          where: { id: registrationId },
          data: {
            status: "CONFIRMED",
            paidAt: new Date(),
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          },
        });

        await writeAuditLog({
          orgId,
          userId: null,
          action: "registration.paid",
          entity: "EventRegistration",
          entityId: registrationId,
          diff: { sessionId: session.id },
        });
      } catch (err) {
        await recordAutomationException({
          orgId,
          workflow: "stripe.checkout.completed",
          step: "registration.update",
          outcome: "FAILED",
          message: err instanceof Error ? err.message : "Registration update failed",
          context: { registrationId, sessionId: session.id },
        });
        throw err;
      }
    }
  }

  return NextResponse.json({ ok: true });
}
