/**
 * Clerk webhook — mirror users/orgs into Postgres + audit on org create
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  deleteOrganization,
  deleteUser,
  recordOrgCreatedAudit,
  upsertOrgMembership,
  upsertOrganizationFromClerk,
  upsertUserFromClerk,
} from "@/lib/clerk-sync";
import { claimWebhookEvent } from "@/lib/webhook-idempotency";
import type { OrgRole } from "@/app/generated/prisma/client";

type ClerkWebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

function mapRole(role: unknown): OrgRole {
  const r = String(role ?? "").toLowerCase();
  if (r === "org:admin" || r === "admin") return "ADMIN";
  if (r === "org:owner" || r === "owner") return "OWNER";
  return "STAFF";
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const headerStore = await headers();
  const svix = new Webhook(secret);

  let event: ClerkWebhookEvent;
  try {
    event = svix.verify(payload, {
      "svix-id": headerStore.get("svix-id") ?? "",
      "svix-timestamp": headerStore.get("svix-timestamp") ?? "",
      "svix-signature": headerStore.get("svix-signature") ?? "",
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  const svixId = headerStore.get("svix-id");
  const idempotencyKey =
    svixId ??
    (typeof data.id === "string" ? `${type}:${data.id}` : null);
  if (idempotencyKey && (await claimWebhookEvent(idempotencyKey, "clerk"))) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  switch (type) {
    case "user.created":
    case "user.updated": {
      const emails = data.email_addresses as Array<{ email_address: string }> | undefined;
      const primaryId = data.primary_email_address_id as string | undefined;
      const primary =
        emails?.find((e) => (data as { id?: string }).id === primaryId)?.email_address ??
        emails?.[0]?.email_address;
      if (!primary || !data.id) break;

      await upsertUserFromClerk({
        id: String(data.id),
        email: primary,
        name: [data.first_name, data.last_name].filter(Boolean).join(" ") || null,
        imageUrl: (data.image_url as string) ?? null,
      });
      break;
    }
    case "user.deleted": {
      if (data.id) await deleteUser(String(data.id));
      break;
    }
    case "organization.created":
    case "organization.updated": {
      if (!data.id || !data.slug || !data.name) break;
      const { created } = await upsertOrganizationFromClerk({
        id: String(data.id),
        slug: String(data.slug),
        name: String(data.name),
      });
      if (created && type === "organization.created") {
        await recordOrgCreatedAudit(String(data.id), null, {
          slug: String(data.slug),
          name: String(data.name),
        });
      }
      break;
    }
    case "organization.deleted": {
      if (data.id) await deleteOrganization(String(data.id));
      break;
    }
    case "organizationMembership.created":
    case "organizationMembership.updated": {
      const orgId = (data.organization as { id?: string })?.id ?? data.organization_id;
      const userId = (data.public_user_data as { user_id?: string })?.user_id ?? data.user_id;
      if (!orgId || !userId) break;
      await upsertOrgMembership({
        orgId: String(orgId),
        userId: String(userId),
        role: mapRole(data.role),
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
