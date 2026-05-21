/**
 * PulsePoint demo seed — leadership-ready sample data.
 *
 * Idempotent: rerun safely. Wipes only the demo organization (`demo-healthcare`)
 * and its children, then reseeds. Other orgs untouched.
 *
 * Usage:
 *   pnpm db:seed:demo
 *
 * Demo login (Clerk): you still sign in with your own Clerk user; this script
 * adds your Clerk userId to the demo org if you set DEMO_OWNER_USER_ID
 * (e.g. `user_2abc...`) in .env.local. Otherwise it seeds a placeholder owner.
 */

import { prisma } from "../lib/prisma";
import { getOrgDb } from "../lib/db";

const ORG_ID = "org_demo_pulsepoint";
const ORG_SLUG = "demo-healthcare";
const ORG_NAME = "Sterling Healthcare Association";

const PLACEHOLDER_OWNER_ID = "user_demo_owner";
const PLACEHOLDER_OWNER_EMAIL = "owner@demo-healthcare.example";

// ---------------- helpers ----------------

function daysFromNow(days: number, hour = 9): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!;
}

// ---------------- members ----------------

const FIRST_NAMES = [
  "Avery", "Brooke", "Camille", "Devon", "Elena", "Felix", "Grace", "Hassan",
  "Imani", "Jamal", "Kira", "Leo", "Maya", "Noah", "Olivia", "Priya",
  "Quinn", "Rosa", "Samir", "Tess", "Uma", "Victor", "Wren", "Xavier",
  "Yara", "Zane", "Adrian", "Beatrice", "Caleb", "Diana", "Emil", "Farah",
  "Gabriel", "Helen", "Ivan", "Jasmine", "Karim", "Liana", "Marco", "Nadia",
  "Omar", "Paloma", "Reza", "Sage", "Tobias", "Ursula", "Vera", "Wesley",
  "Yusuf", "Zoe",
];

const LAST_NAMES = [
  "Reyes", "Patel", "Chen", "Okafor", "Sullivan", "Nguyen", "Bennett", "Khan",
  "Russo", "Martinez", "Park", "Adebayo", "Lindgren", "Cohen", "Singh", "Diaz",
  "Hernandez", "Suzuki", "Brennan", "Vargas", "Yamada", "Mendez", "Olsen",
  "Cole", "Hayes", "Romero", "Fischer", "Antwi", "Levy", "Tan", "Brooks",
  "Petrova", "Gomez", "Eze", "Ito", "Hassan", "Kruger", "Lopez", "Rivera",
  "Andersson", "Costa", "Ferraro", "Hughes", "Imani", "Kowalski", "Lin",
  "Mahoney", "Ng", "Park", "Sokolov",
];

const TAG_POOL = [
  ["board"],
  ["chapter:northeast"],
  ["chapter:south"],
  ["chapter:west"],
  ["committee:advocacy"],
  ["committee:education"],
  ["sponsor"],
  ["faculty"],
  ["new-grad"],
  ["renewal-due"],
  [],
  [],
];

const STATUS_DISTRIBUTION: ("ACTIVE" | "INACTIVE" | "LAPSED")[] = [
  ...Array.from({ length: 36 }, () => "ACTIVE" as const),
  ...Array.from({ length: 8 }, () => "LAPSED" as const),
  ...Array.from({ length: 6 }, () => "INACTIVE" as const),
];

// ---------------- main ----------------

async function wipeDemo() {
  // Delete demo org cascades through members/events/registrations/notes/etc.
  await prisma.organization.deleteMany({ where: { id: ORG_ID } });
  // Owner placeholder cleanup (only if no other orgs)
  await prisma.user
    .deleteMany({ where: { id: PLACEHOLDER_OWNER_ID } })
    .catch(() => undefined);
}

async function seedOrgAndOwner() {
  await prisma.organization.create({
    data: {
      id: ORG_ID,
      slug: ORG_SLUG,
      name: ORG_NAME,
      plan: "demo",
    },
  });

  const ownerClerkId = process.env.DEMO_OWNER_USER_ID;

  if (ownerClerkId) {
    // Real Clerk user → attach as OWNER so you can sign in and see the org.
    const existingUser = await prisma.user.findUnique({
      where: { id: ownerClerkId },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: ownerClerkId,
          email: `${ownerClerkId}@clerk.placeholder`,
          name: "Demo Owner (Clerk)",
        },
      });
    }
    await prisma.orgMembership.create({
      data: { orgId: ORG_ID, userId: ownerClerkId, role: "OWNER" },
    });
    return ownerClerkId;
  }

  // No Clerk id → seed a placeholder owner so audit logs / notes have an author.
  await prisma.user.upsert({
    where: { id: PLACEHOLDER_OWNER_ID },
    create: {
      id: PLACEHOLDER_OWNER_ID,
      email: PLACEHOLDER_OWNER_EMAIL,
      name: "Demo Owner",
    },
    update: {},
  });
  await prisma.orgMembership.create({
    data: { orgId: ORG_ID, userId: PLACEHOLDER_OWNER_ID, role: "OWNER" },
  });
  return PLACEHOLDER_OWNER_ID;
}

type SeededMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

async function seedMembers(): Promise<SeededMember[]> {
  const db = getOrgDb(ORG_ID);
  const members: SeededMember[] = [];

  for (let i = 0; i < 50; i++) {
    const firstName = pick(FIRST_NAMES, i);
    const lastName = pick(LAST_NAMES, i * 3 + 7);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@demo-healthcare.example`;
    const tags = pick(TAG_POOL, i * 5 + 1);
    const status = STATUS_DISTRIBUTION[i % STATUS_DISTRIBUTION.length]!;
    const joinedAgoDays = 30 + ((i * 17) % 1200);

    const created = await db.member.create({
      data: {
        orgId: ORG_ID,
        firstName,
        lastName,
        email,
        phone: i % 4 === 0 ? `+1-555-${String(100 + i).padStart(4, "0")}` : null,
        status,
        tags: [...tags],
        joinedAt: daysFromNow(-joinedAgoDays, 12),
        customFields: {
          credentials: i % 5 === 0 ? "MD" : i % 5 === 1 ? "RN" : i % 5 === 2 ? "MPH" : "",
          state: pick(["PA", "NY", "CA", "TX", "FL", "IL", "OH", "GA"], i + 2),
        },
      },
    });

    members.push({
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email!,
    });
  }

  return members;
}

async function seedMemberNotes(members: SeededMember[], ownerUserId: string) {
  const db = getOrgDb(ORG_ID);
  const snippets = [
    "Spoke at chapter meeting; wants to mentor new grads.",
    "Renewal payment failed last cycle; resolved by ADMIN.",
    "Interested in serving on the advocacy committee next term.",
    "Requested CE transcript — flag once Learn ships.",
    "Sponsor contact for spring conference exhibits.",
  ];

  for (let i = 0; i < 12; i++) {
    const member = members[(i * 4) % members.length]!;
    await db.memberNote.create({
      data: {
        orgId: ORG_ID,
        memberId: member.id,
        authorUserId: ownerUserId,
        body: snippets[i % snippets.length]!,
      },
    });
  }
}

async function seedEvents() {
  const db = getOrgDb(ORG_ID);

  const past = await db.event.create({
    data: {
      orgId: ORG_ID,
      title: "Winter 2026 Member Town Hall",
      description:
        "Annual member town hall — board updates, advocacy priorities, and Q&A.\nRecording posted to the member portal.",
      startsAt: daysFromNow(-45, 10),
      endsAt: daysFromNow(-45, 12),
      capacity: 200,
      priceCents: 0,
      status: "COMPLETED",
      publicSlug: "winter-2026-town-hall",
    },
  });

  const upcomingFree = await db.event.create({
    data: {
      orgId: ORG_ID,
      title: "Spring Advocacy Briefing",
      description:
        "Virtual briefing for members on healthcare policy priorities heading into the 2026 legislative session.\nFree for members; sponsor speakers from the regulatory committee.",
      startsAt: daysFromNow(14, 13),
      endsAt: daysFromNow(14, 15),
      capacity: 300,
      priceCents: 0,
      status: "PUBLISHED",
      publicSlug: "spring-advocacy-briefing",
    },
  });

  const upcomingPaid = await db.event.create({
    data: {
      orgId: ORG_ID,
      title: "Annual Clinical Leadership Summit",
      description:
        "Two-day in-person summit for clinical leaders. Workshops, CE-eligible sessions, evening reception.\nEarly-bird member rate.",
      startsAt: daysFromNow(42, 8),
      endsAt: daysFromNow(43, 17),
      capacity: 120,
      priceCents: 29500,
      status: "PUBLISHED",
      publicSlug: "clinical-leadership-summit-2026",
    },
  });

  const draft = await db.event.create({
    data: {
      orgId: ORG_ID,
      title: "Fall Chapter Mixer",
      description: "Draft — chapter leadership planning networking event.",
      startsAt: daysFromNow(90, 18),
      endsAt: daysFromNow(90, 21),
      capacity: 80,
      priceCents: 0,
      status: "DRAFT",
      publicSlug: "fall-chapter-mixer",
    },
  });

  return { past, upcomingFree, upcomingPaid, draft };
}

async function seedRegistrations(
  events: { past: { id: string }; upcomingFree: { id: string }; upcomingPaid: { id: string } },
  members: SeededMember[],
) {
  const db = getOrgDb(ORG_ID);

  // Past event — 35 registrations, ~30 checked in
  for (let i = 0; i < 35; i++) {
    const m = members[i]!;
    await db.eventRegistration.create({
      data: {
        orgId: ORG_ID,
        eventId: events.past.id,
        memberId: m.id,
        guestEmail: m.email,
        guestName: `${m.firstName} ${m.lastName}`,
        status: "CONFIRMED",
        checkedInAt: i < 30 ? daysFromNow(-45, 10) : null,
      },
    });
  }

  // Upcoming free — 80 registrations capped, ~20 added (with 2 waitlist)
  for (let i = 0; i < 22; i++) {
    const m = members[(i + 10) % members.length]!;
    const waitlist = i >= 20;
    await db.eventRegistration.create({
      data: {
        orgId: ORG_ID,
        eventId: events.upcomingFree.id,
        memberId: m.id,
        guestEmail: m.email,
        guestName: `${m.firstName} ${m.lastName}`,
        status: waitlist ? "WAITLIST" : "CONFIRMED",
      },
    });
  }

  // Upcoming paid — 12 registrations: 8 paid, 3 pending, 1 cancelled
  for (let i = 0; i < 12; i++) {
    const m = members[(i + 20) % members.length]!;
    const state: "CONFIRMED" | "PENDING" | "CANCELLED" =
      i < 8 ? "CONFIRMED" : i < 11 ? "PENDING" : "CANCELLED";
    await db.eventRegistration.create({
      data: {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        memberId: m.id,
        guestEmail: m.email,
        guestName: `${m.firstName} ${m.lastName}`,
        status: state,
        paidAt: state === "CONFIRMED" ? daysFromNow(-5, 14) : null,
        stripePaymentIntentId:
          state === "CONFIRMED" ? `pi_demo_${i}_${Date.now()}` : null,
      },
    });
  }
}

async function seedExceptions() {
  const db = getOrgDb(ORG_ID);

  await db.automationException.create({
    data: {
      orgId: ORG_ID,
      workflow: "registration.confirm_email",
      step: "resend.send",
      outcome: "PARTIAL_SUCCESS",
      message:
        "Resend returned 429 (rate limited). Registration is CONFIRMED; email not delivered.",
      context: { event: "Spring Advocacy Briefing" },
    },
  });

  await db.automationException.create({
    data: {
      orgId: ORG_ID,
      workflow: "stripe.checkout.completed",
      step: "registration.lookup",
      outcome: "PARTIAL_SUCCESS",
      message:
        "Stripe paid but registrationId missing in metadata. Manual reconcile required.",
      context: { sessionId: "cs_demo_123" },
    },
  });

  // One already resolved — proves staff used the queue.
  await db.automationException.create({
    data: {
      orgId: ORG_ID,
      workflow: "member.import_applied",
      step: "audit.write",
      outcome: "PARTIAL_SUCCESS",
      message: "Audit row failed once; retried successfully.",
      context: { batchId: "demo-batch" },
      resolvedAt: daysFromNow(-2, 9),
    },
  });
}

async function seedImportBatches(ownerUserId: string) {
  const db = getOrgDb(ORG_ID);

  const pending = await db.memberImportBatch.create({
    data: {
      orgId: ORG_ID,
      uploadedById: ownerUserId,
      fileName: "spring-2026-new-members.csv",
      status: "PENDING_REVIEW",
      rowCount: 0,
    },
  });

  const stagingRows = [
    { firstName: "Priya", lastName: "Patel", email: "priya.patel.import@example.com" },
    { firstName: "Daniel", lastName: "Okafor", email: "daniel.okafor.import@example.com" },
    { firstName: "Sara", lastName: "Lopez", email: "sara.lopez.import@example.com" },
    { firstName: "Jin", lastName: "Park", email: "jin.park.import@example.com" },
    { firstName: "Avery", lastName: "Reyes", email: "avery.reyes0@demo-healthcare.example" }, // duplicate of seeded member
    { firstName: "Marcus", lastName: "Hall", email: "marcus.hall.import@example.com" },
  ];

  for (let i = 0; i < stagingRows.length; i++) {
    const r = stagingRows[i]!;
    const dup = await db.member.findFirst({ where: { email: r.email } });
    await db.memberImportRow.create({
      data: {
        orgId: ORG_ID,
        batchId: pending.id,
        rowIndex: i,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        status: dup ? "SKIPPED_DUPLICATE" : "PENDING",
        matchMemberId: dup?.id ?? null,
      },
    });
  }

  await db.memberImportBatch.update({
    where: { id: pending.id },
    data: { rowCount: stagingRows.length },
  });

  // A historic applied batch to give the page texture.
  await db.memberImportBatch.create({
    data: {
      orgId: ORG_ID,
      uploadedById: ownerUserId,
      fileName: "winter-2026-renewals.csv",
      status: "APPLIED",
      rowCount: 18,
      appliedAt: daysFromNow(-12, 11),
    },
  });
}

async function seedAuditTrail(ownerUserId: string) {
  // Audit log writes through prisma.auditLog directly (it's the audit writer's job).
  await prisma.auditLog.createMany({
    data: [
      {
        orgId: ORG_ID,
        userId: ownerUserId,
        action: "organization.created",
        entity: "Organization",
        entityId: ORG_ID,
      },
      {
        orgId: ORG_ID,
        userId: ownerUserId,
        action: "member.exported",
        entity: "Member",
        diff: { count: 50 },
      },
      {
        orgId: ORG_ID,
        userId: ownerUserId,
        action: "event.created",
        entity: "Event",
        diff: { title: "Annual Clinical Leadership Summit" },
      },
    ],
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set — cannot seed demo data");
  }

  console.log("Wiping previous demo data…");
  await wipeDemo();

  console.log("Seeding organization + owner…");
  const ownerUserId = await seedOrgAndOwner();

  console.log("Seeding 50 members…");
  const members = await seedMembers();

  console.log("Seeding staff notes…");
  await seedMemberNotes(members, ownerUserId);

  console.log("Seeding events…");
  const events = await seedEvents();

  console.log("Seeding registrations + check-ins…");
  await seedRegistrations(events, members);

  console.log("Seeding exception queue rows…");
  await seedExceptions();

  console.log("Seeding import batches…");
  await seedImportBatches(ownerUserId);

  console.log("Seeding audit trail…");
  await seedAuditTrail(ownerUserId);

  console.log("");
  console.log("Demo seed complete.");
  console.log(`  Org slug:  ${ORG_SLUG}`);
  console.log(`  Org name:  ${ORG_NAME}`);
  console.log(`  Members:   ${members.length}`);
  console.log(`  Events:    4 (1 completed, 2 published, 1 draft)`);
  console.log(`  URL:       http://localhost:3000/${ORG_SLUG}`);
  if (!process.env.DEMO_OWNER_USER_ID) {
    console.log("");
    console.log("Tip: set DEMO_OWNER_USER_ID=<your Clerk user id> in .env.local");
    console.log("     then rerun `pnpm db:seed:demo` so your real Clerk user owns the org.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
