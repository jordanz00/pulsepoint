/**
 * Stripe webhook — mark paid event registrations and commerce orders (idempotent)
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
import { markDonationPaid } from "@/lib/giving/mark-donation-paid";
import { markCommerceOrderPaid } from "@/lib/commerce/mark-order-paid";

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
    const orgId = session.metadata?.orgId;
    const reference =
      session.client_reference_id ??
      session.metadata?.ourReference ??
      session.metadata?.registrationId;

    if (!orgId || !reference) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const db = getOrgDb(orgId);

    // Commerce order (ourReference = CommerceOrder.id)
    const order = await db.commerceOrder.findFirst({ where: { id: reference } });
    if (order) {
      try {
        const paid = await markCommerceOrderPaid(db, orgId, order.id, new Date(), {
          sessionId: session.id,
        });
        if (!paid.ok) {
          return NextResponse.json({ ok: true, skipped: true });
        }
        return NextResponse.json({
          ok: true,
          commerce: true,
          duplicate: paid.duplicate,
        });
      } catch (err) {
        await recordAutomationException({
          orgId,
          workflow: "stripe.checkout.completed",
          step: "commerce_order.update",
          outcome: "FAILED",
          message: err instanceof Error ? err.message : "Commerce order update failed",
          context: { orderId: order.id, sessionId: session.id },
        });
        throw err;
      }
    }

    const donation = await db.donation.findFirst({ where: { id: reference } });
    if (donation) {
      if (donation.paidAt) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      try {
        const paid = await markDonationPaid(db, donation.id, {
          adapterId: "stripe",
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        });
        if (paid) {
          await writeAuditLog({
            orgId,
            userId: null,
            action: "giving.donation.paid",
            entity: "Donation",
            entityId: donation.id,
            diff: { sessionId: session.id, amountCents: donation.amountCents },
          });
        }
      } catch (err) {
        await recordAutomationException({
          orgId,
          workflow: "stripe.checkout.completed",
          step: "donation.update",
          outcome: "FAILED",
          message: err instanceof Error ? err.message : "Donation update failed",
          context: { donationId: donation.id, sessionId: session.id },
        });
        throw err;
      }
      return NextResponse.json({ ok: true, donation: true });
    }

    // Event registration (ourReference = EventRegistration.id)
    const registrationId = session.metadata?.registrationId ?? reference;
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

      if (reg.status === "CONFIRMED") {
        return NextResponse.json({ ok: true, duplicate: true });
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

  return NextResponse.json({ ok: true });
}
