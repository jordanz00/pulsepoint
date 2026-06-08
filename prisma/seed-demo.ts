import "dotenv/config";

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
import { WORKFLOW_TEMPLATES } from "../lib/crm/workflow-templates";
import { defaultLeadQualificationAutomations } from "../lib/crm/workflow-automation";
import { EMAIL_SEQUENCE_TEMPLATES } from "../lib/crm/sequence-templates";
import { DEFAULT_LEAD_FORM_FIELDS } from "../lib/crm/web-form-fields";
import { resolveStages, stageIdForStep } from "../lib/crm/workflow-utils";
import { enrichProspect } from "../lib/crm/prospector-enrichment";
import { DEFAULT_REPORT_WIDGETS } from "../lib/deals/constants";
import { computeMemberPulse } from "../lib/member-pulse/compute";
import type { Prisma } from "@/app/generated/prisma/client";

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
      directoryConfig: {
        directoryPublic: true,
        visibility: "public",
        fields: ["name", "email", "credentials", "chapter"],
        searchable: ["name", "email"],
        showPhotos: false,
      },
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
  tags: string[];
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
        clerkUserId: i === 0 ? PLACEHOLDER_OWNER_ID : undefined,
        firstName,
        lastName,
        email,
        phone: i % 4 === 0 ? `+1-555-${String(100 + i).padStart(4, "0")}` : null,
        status,
        tags: [...tags],
        joinedAt: daysFromNow(-joinedAgoDays, 12),
        customFields:
          i < 8
            ? {
                credentials: i % 5 === 0 ? "MD" : i % 5 === 1 ? "RN" : i % 5 === 2 ? "MPH" : "",
                state: pick(["PA", "NY", "CA", "TX", "FL", "IL", "OH", "GA"], i + 2),
                address: {
                  line1: `${100 + i} Market St`,
                  line2: i % 2 === 0 ? "Suite 200" : "",
                  city: pick(["Harrisburg", "Philadelphia", "Pittsburgh"], i),
                  state: "PA",
                  postalCode: `1710${i}`,
                  country: "US",
                },
                billing: {
                  billToName: `${firstName} ${lastName}`,
                  billingEmail: email,
                  defaultPaymentMethod: i % 3 === 0 ? "ach" : "card",
                  poNumber: i % 4 === 0 ? `PO-DEMO-${i}` : "",
                  autopay: i % 2 === 0,
                },
                communicationPreferences: {
                  preferredChannel: pick(["email", "phone", "mail"], i) as "email" | "phone" | "mail",
                  emailMarketing: true,
                  eventReminders: true,
                  renewalNotices: true,
                  smsAlerts: i % 3 === 0,
                },
                otherDetails:
                  i === 0
                    ? "Demo profile: full address, billing, and comm prefs for MemberCore UI."
                    : "",
              }
            : {
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
      tags: [...tags],
    });
  }

  return members;
}

async function seedCrm(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const workflowIds: string[] = [];
  for (const t of WORKFLOW_TEMPLATES) {
    const exists = await db.crmWorkflow.findFirst({
      where: { orgId: ORG_ID, fromTemplate: t.templateKey },
    });
    if (!exists) {
      const created = await db.crmWorkflow.create({
        data: {
          orgId: ORG_ID,
          name: t.name,
          kind: t.kind,
          description: t.description,
          department: t.department,
          fromTemplate: t.templateKey,
          steps: t.stages.map((s) => ({
            id: s.id,
            order: s.order,
            type: "task",
            label: s.label,
          })),
          stages: t.stages,
          fields: t.fields,
          ...(t.templateKey === "lead_qualification"
            ? { stageAutomations: defaultLeadQualificationAutomations() }
            : {}),
        },
      });
      workflowIds.push(created.id);
    } else {
      workflowIds.push(exists.id);
    }
  }

  const onboard = await db.crmWorkflow.findFirst({
    where: { orgId: ORG_ID, kind: "ONBOARD_MEMBER" },
  });
  const reEngage = await db.crmWorkflow.findFirst({
    where: { orgId: ORG_ID, kind: "RE_ENGAGE" },
  });
  const board = await db.crmWorkflow.findFirst({
    where: { orgId: ORG_ID, kind: "BOARD_OUTREACH" },
  });

  const seedWorkflows = [onboard, reEngage, board].filter(Boolean);
  for (let i = 0; i < Math.min(6, members.length); i++) {
    const m = members[i]!;
    const wf = seedWorkflows[i % seedWorkflows.length];
    if (!wf) continue;
    const stages = resolveStages(wf.stages, wf.steps);
    const stageIdx = i % Math.max(1, stages.length - 1);
    await db.crmWorkflowRun.create({
      data: {
        orgId: ORG_ID,
        workflowId: wf.id,
        memberId: m.id,
        stageId: stageIdForStep(stages, stageIdx),
        currentStep: stageIdx,
        fieldValues: {
          owner: "Demo staff",
          priority: i % 2 === 0 ? "High" : "Medium",
        },
        dueAt: daysFromNow(5 + i),
      },
    });
  }

  for (let i = 0; i < Math.min(8, members.length); i++) {
    const m = members[i]!;
    const company = i < 3 ? "Sterling Health System" : "Regional Medical Group";
    const jobTitle =
      i === 0 ? "President & CEO" : i === 1 ? "Board Chair" : "Director of Advocacy";
    await db.member.update({
      where: { id: m.id },
      data: {
        company,
        jobTitle,
        relationshipHealth: i === 0 ? "STRONG" : i < 3 ? "STEADY" : "COOLING",
        lastTouchAt: daysFromNow(-(i + 2)),
        nextFollowUpAt: i < 5 ? daysFromNow(7 + i) : null,
        enrichmentData: enrichProspect({
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          company,
          jobTitle,
        }),
      },
    });
    await db.contactSource.create({
      data: {
        orgId: ORG_ID,
        memberId: m.id,
        sourceKind: i % 2 === 0 ? "CSV_IMPORT" : "MANUAL",
        label: i % 2 === 0 ? "Legacy AMS export" : "Staff entry",
      },
    });
  }

  const leadWf = await db.crmWorkflow.findFirst({
    where: { orgId: ORG_ID, fromTemplate: "lead_qualification" },
  });
  const formExists = await db.webForm.findFirst({ where: { orgId: ORG_ID, slug: "lead-capture" } });
  if (!formExists) {
    await db.webForm.create({
      data: {
        orgId: ORG_ID,
        slug: "lead-capture",
        name: "Lead capture",
        description: "Default inbound lead form — thank-you email on submit.",
        fields: DEFAULT_LEAD_FORM_FIELDS,
        published: true,
        confirmEmailSubject: "Thanks — we received your request",
        confirmEmailBody:
          "Thank you for contacting Sterling Healthcare Association. We will follow up within one business day.",
        addToWorkflowId: leadWf?.id,
      },
    });
  }

  if (members[0] && members[1]) {
    await db.memberRelationship.create({
      data: {
        orgId: ORG_ID,
        fromMemberId: members[0].id,
        toMemberId: members[1].id,
        relationType: "BOARD_PEER",
        strength: 5,
        notes: "Executive leadership team — quarterly touch cadence",
      },
    });
  }
}

async function seedDeals() {
  const db = getOrgDb(ORG_ID);

  const existing = await db.dealPipeline.count();
  if (existing > 0) return;

  const pipelineMain = await db.dealPipeline.create({
    data: {
      orgId: ORG_ID,
      name: "Sponsorship & partnerships",
      isDefault: true,
    },
  });
  const pipelineCorp = await db.dealPipeline.create({
    data: {
      orgId: ORG_ID,
      name: "Corporate membership",
      isDefault: false,
    },
  });

  const reasonLabels = ["Budget constraints", "Timing", "Chose competitor", "No decision"];
  const reasons: { id: string; label: string }[] = [];
  for (let i = 0; i < reasonLabels.length; i++) {
    const r = await db.dealLossReason.create({
      data: { orgId: ORG_ID, label: reasonLabels[i]!, sortOrder: i },
    });
    reasons.push(r);
  }

  const reps = ["Jordan Lee", "Alex Morgan", "Sam Patel"];
  const titles = [
    "Annual summit platinum sponsor",
    "Clinical leadership series",
    "Board retreat underwriting",
    "Workforce policy forum",
    "Regional chapter grant",
    "Innovation lab naming rights",
    "Policy fly-in package",
    "Executive roundtable series",
  ];

  const stages = [
    "LEAD",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "WON",
    "LOST",
  ] as const;

  for (let i = 0; i < 28; i++) {
    const pipeline = i % 5 === 0 ? pipelineCorp : pipelineMain;
    const stage = stages[i % stages.length]!;
    const rep = reps[i % reps.length]!;
    const amountCents = (25_000 + (i % 8) * 15_000) * 100;
    const isWon = stage === "WON";
    const isLost = stage === "LOST";

    await db.deal.create({
      data: {
        orgId: ORG_ID,
        pipelineId: pipeline.id,
        title: `${titles[i % titles.length]!} #${i + 1}`,
        amountCents,
        stage,
        assigneeName: rep,
        lostAtStage: isLost ? ("PROPOSAL" as const) : null,
        lossReasonId: isLost ? reasons[i % reasons.length]!.id : null,
        expectedCloseAt: !isWon && !isLost ? daysFromNow(30 + i) : null,
        closedAt: isWon
          ? daysFromNow(-(60 - (i % 12) * 5))
          : isLost
            ? daysFromNow(-(20 + (i % 6) * 3))
            : null,
        createdAt: daysFromNow(-(90 + i * 2)),
      },
    });
  }

  const dashMain = await db.dealReportDashboard.create({
    data: {
      orgId: ORG_ID,
      name: "Sales performance",
      description: "Org-wide sponsorship pipeline analytics",
      visibility: "TEAM",
      isDefault: true,
      filters: { pipelineId: pipelineMain.id },
      createdBy: PLACEHOLDER_OWNER_ID,
    },
  });

  for (let i = 0; i < DEFAULT_REPORT_WIDGETS.length; i++) {
    const w = DEFAULT_REPORT_WIDGETS[i]!;
    await db.dealReportWidget.create({
      data: {
        orgId: ORG_ID,
        dashboardId: dashMain.id,
        reportType: w.reportType,
        chartType: w.chartType,
        title: w.title,
        sortOrder: i,
        filters: {},
      },
    });
  }

  const dashCorp = await db.dealReportDashboard.create({
    data: {
      orgId: ORG_ID,
      name: "Corporate membership",
      description: "Filtered to corporate membership pipeline",
      visibility: "TEAM",
      isDefault: false,
      filters: { pipelineId: pipelineCorp.id },
      createdBy: PLACEHOLDER_OWNER_ID,
    },
  });

  await db.dealReportWidget.createMany({
    data: [
      {
        orgId: ORG_ID,
        dashboardId: dashCorp.id,
        reportType: "DEAL_PROGRESS",
        chartType: "BAR",
        title: "Deal progress",
        sortOrder: 0,
        filters: {},
      },
      {
        orgId: ORG_ID,
        dashboardId: dashCorp.id,
        reportType: "TEAM_LEADERBOARD",
        chartType: "TABLE",
        title: "Rep leaderboard",
        sortOrder: 1,
        filters: {},
      },
      {
        orgId: ORG_ID,
        dashboardId: dashCorp.id,
        reportType: "LOST_BY_STAGE",
        chartType: "DONUT",
        title: "Lost by stage",
        sortOrder: 2,
        filters: { assigneeName: "Alex Morgan" },
      },
    ],
  });
}

async function seedMemberRoles(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const samples: Array<{
    memberIdx: number;
    category: "EXECUTIVE" | "BOARD" | "COMMITTEE" | "CHAPTER" | "STAFF";
    scope: "THIS_ASSOCIATION" | "EXTERNAL_ORGANIZATION";
    leadershipLevel?: "C_SUITE" | "SENIOR_EXECUTIVE" | "DIRECTOR" | null;
    title: string;
    organizationName?: string;
  }> = [
    {
      memberIdx: 0,
      category: "EXECUTIVE",
      scope: "THIS_ASSOCIATION",
      leadershipLevel: "C_SUITE",
      title: "President & CEO",
    },
    {
      memberIdx: 1,
      category: "BOARD",
      scope: "THIS_ASSOCIATION",
      leadershipLevel: "C_SUITE",
      title: "Board Chair",
    },
    {
      memberIdx: 2,
      category: "EXECUTIVE",
      scope: "THIS_ASSOCIATION",
      leadershipLevel: "C_SUITE",
      title: "Chief Operating Officer",
    },
    {
      memberIdx: 3,
      category: "BOARD",
      scope: "EXTERNAL_ORGANIZATION",
      leadershipLevel: "SENIOR_EXECUTIVE",
      title: "Trustee",
      organizationName: "American Hospital Association",
    },
    {
      memberIdx: 4,
      category: "BOARD",
      scope: "EXTERNAL_ORGANIZATION",
      title: "Board member",
      organizationName: "State Nurses Association",
    },
    {
      memberIdx: 5,
      category: "COMMITTEE",
      scope: "THIS_ASSOCIATION",
      leadershipLevel: "DIRECTOR",
      title: "Finance Committee Chair",
    },
    {
      memberIdx: 6,
      category: "CHAPTER",
      scope: "THIS_ASSOCIATION",
      title: "Chapter President — Northeast",
    },
    {
      memberIdx: 7,
      category: "BOARD",
      scope: "EXTERNAL_ORGANIZATION",
      title: "Director",
      organizationName: "Regional Health Collaborative",
    },
    {
      memberIdx: 8,
      category: "EXECUTIVE",
      scope: "THIS_ASSOCIATION",
      leadershipLevel: "SENIOR_EXECUTIVE",
      title: "Chief Advocacy Officer",
    },
    {
      memberIdx: 9,
      category: "COMMITTEE",
      scope: "THIS_ASSOCIATION",
      title: "Membership Committee",
    },
    {
      memberIdx: 10,
      category: "STAFF",
      scope: "THIS_ASSOCIATION",
      title: "Director of Member Services",
    },
  ];

  for (const s of samples) {
    const member = members[s.memberIdx];
    if (!member) continue;
    await db.memberRole.create({
      data: {
        orgId: ORG_ID,
        memberId: member.id,
        category: s.category,
        scope: s.scope,
        leadershipLevel: s.leadershipLevel ?? null,
        title: s.title,
        organizationName: s.organizationName ?? null,
        isCurrent: true,
      },
    });
  }
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

  const channels = [
    "email",
    "meeting",
    "advocacy",
    "policy",
    "board",
    "call",
  ] as const;

  for (let i = 0; i < 12; i++) {
    const member = members[(i * 4) % members.length]!;
    await db.memberNote.create({
      data: {
        orgId: ORG_ID,
        memberId: member.id,
        authorUserId: ownerUserId,
        body: snippets[i % snippets.length]!,
        channel: channels[i % channels.length],
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
        "Two-day flagship conference for clinical leaders. Keynotes, CE-eligible workshops, sponsor expo, and evening reception.\nEarly-bird member rate available through ticket types.",
      startsAt: daysFromNow(42, 8),
      endsAt: daysFromNow(43, 17),
      capacity: 120,
      priceCents: 29500,
      status: "PUBLISHED",
      publicSlug: "clinical-leadership-summit-2026",
      micrositeConfig: {
        headline: "Lead the future of clinical excellence",
        accent: "#0369a1",
        showSpeakers: true,
        showSponsors: true,
        showSessions: true,
      },
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

// ---------------- alpha modules: Learn / Giving / Commerce / Engage / Insights ----------------

async function seedLearn(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const cme = await db.cECreditType.create({
    data: {
      orgId: ORG_ID,
      code: "CME",
      name: "Continuing Medical Education",
      description: "AMA PRA Category 1 equivalents.",
    },
  });
  const cne = await db.cECreditType.create({
    data: {
      orgId: ORG_ID,
      code: "CNE",
      name: "Continuing Nursing Education",
      description: "Nursing CE credits.",
    },
  });
  const ceu = await db.cECreditType.create({
    data: {
      orgId: ORG_ID,
      code: "CEU",
      name: "Continuing Education Unit",
      description: "Generic CEUs for allied health.",
    },
  });

  const courseSummit = await db.course.create({
    data: {
      orgId: ORG_ID,
      title: "Clinical Leadership: Modern Quality & Safety",
      description: "Companion course to the Annual Clinical Leadership Summit.",
      creditTypeId: cme.id,
      creditAmount: 8,
      status: "PUBLISHED",
    },
  });
  await db.course.create({
    data: {
      orgId: ORG_ID,
      title: "Healthcare Policy 101 for New Members",
      description: "Self-paced primer on regulatory advocacy and 340B basics.",
      creditTypeId: ceu.id,
      creditAmount: 2,
      status: "PUBLISHED",
    },
  });
  await db.course.create({
    data: {
      orgId: ORG_ID,
      title: "RN-to-Manager Transition (draft)",
      description: "Course outline in development.",
      creditTypeId: cne.id,
      creditAmount: 4,
      status: "DRAFT",
    },
  });

  // 6 awards across 6 different members so the recent list is populated.
  for (let i = 0; i < 6; i++) {
    const m = members[(i * 7) % members.length]!;
    const ct = i % 3 === 0 ? cme : i % 3 === 1 ? cne : ceu;
    await db.cECreditAward.create({
      data: {
        orgId: ORG_ID,
        memberId: m.id,
        creditTypeId: ct.id,
        amount: i === 0 ? 8 : 1 + (i % 3),
        source: i === 0 ? "course_completion" : "manual",
        sourceRef: i === 0 ? courseSummit.id : null,
        note: i === 0 ? "Auto-awarded after summit attendance" : "",
      },
    });
  }
}

async function seedWorkforce(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const fairStarts = new Date();
  fairStarts.setDate(fairStarts.getDate() + 45);
  const fairEnds = new Date(fairStarts);
  fairEnds.setHours(fairEnds.getHours() + 3);

  const careerFair = await db.event.create({
    data: {
      orgId: ORG_ID,
      title: "2026 Virtual Nursing & Allied Health Career Fair",
      description:
        "Alpha demo — employer booths and live chat are roadmap. Illustrative only.",
      startsAt: fairStarts,
      endsAt: fairEnds,
      format: "VIRTUAL",
      eventKind: "VIRTUAL_CAREER_FAIR",
      status: "PUBLISHED",
      publicSlug: "nursing-career-fair-2026",
      capacity: 500,
      micrositeConfig: {
        careerFair: {
          disclaimer:
            "Alpha preview — booth chat and live video are roadmap. Employer listings are illustrative.",
          booths: [
            {
              id: "booth-1",
              employerName: "Sterling Regional Medical Center",
              boothNumber: "A1",
              pitch: "Magnet-designated system · new grad residency",
              rolesHiring: "RN, LPN, CNA",
            },
            {
              id: "booth-2",
              employerName: "North River Health Plan",
              boothNumber: "A2",
              pitch: "Integrated delivery · behavioral health expansion",
              rolesHiring: "Behavioral health RN, NP",
            },
            {
              id: "booth-3",
              employerName: "Summit Children's Hospital",
              boothNumber: "B1",
              pitch: "Pediatric specialty care across 3 campuses",
              rolesHiring: "PICU RN, RT",
            },
            {
              id: "booth-4",
              employerName: "Valley Community Hospital",
              boothNumber: "B2",
              pitch: "Critical access · loan forgiveness eligible",
              rolesHiring: "ED RN, Lab tech",
            },
            {
              id: "booth-5",
              employerName: "Keystone Academic Medical Center",
              boothNumber: "C1",
              pitch: "Teaching hospital · allied health fellowships",
              rolesHiring: "Allied health, Imaging",
            },
            {
              id: "booth-6",
              employerName: "Riverside Home Health",
              boothNumber: "C2",
              pitch: "Home-based care growth market",
              rolesHiring: "Home health RN, PT",
            },
            {
              id: "booth-7",
              employerName: "Capital City Trauma Center",
              boothNumber: "D1",
              pitch: "Level I trauma · sign-on incentives",
              rolesHiring: "Trauma RN, Surgical tech",
            },
            {
              id: "booth-8",
              employerName: "Lakeside Long-Term Care",
              boothNumber: "D2",
              pitch: "Skilled nursing · culture-first hiring",
              rolesHiring: "LPN, CNA, Dietary",
            },
          ],
        },
      },
    },
  });

  const playlist = await db.learnVideoPlaylist.create({
    data: {
      orgId: ORG_ID,
      title: "Nursing pipeline — getting started",
      description:
        "Illustrative preview clips for nursing students and new grads — replace with your association-approved content.",
      trackSlug: "nursing",
      sortOrder: 1,
    },
  });

  await db.learnVideoItem.createMany({
    data: [
      {
        orgId: ORG_ID,
        playlistId: playlist.id,
        title: "Welcome to hospital careers",
        videoUrl: "https://www.youtube.com/watch?v=rQ8Q4-njXrE",
        durationMin: 8,
        ceEligible: false,
        sortOrder: 1,
      },
      {
        orgId: ORG_ID,
        playlistId: playlist.id,
        title: "Loan forgiveness programs overview",
        videoUrl: "https://www.youtube.com/watch?v=3P1CnWr58Ts",
        durationMin: 12,
        ceEligible: true,
        sortOrder: 2,
      },
    ],
  });

  const alliedPlaylist = await db.learnVideoPlaylist.create({
    data: {
      orgId: ORG_ID,
      title: "Allied health pathways",
      description: "Illustrative clips for lab, imaging, and therapy tracks.",
      trackSlug: "allied-health",
      sortOrder: 2,
    },
  });

  await db.learnVideoItem.createMany({
    data: [
      {
        orgId: ORG_ID,
        playlistId: alliedPlaylist.id,
        title: "Allied health roles in hospitals",
        videoUrl: "https://www.youtube.com/watch?v=I_kNf606tQA",
        durationMin: 6,
        ceEligible: false,
        sortOrder: 1,
      },
    ],
  });

  const advocacyPlaylist = await db.learnVideoPlaylist.create({
    data: {
      orgId: ORG_ID,
      title: "Advocacy 101 for members",
      description: "How hospital associations engage on policy — illustrative only.",
      trackSlug: "advocacy-101",
      sortOrder: 3,
    },
  });

  await db.learnVideoItem.createMany({
    data: [
      {
        orgId: ORG_ID,
        playlistId: advocacyPlaylist.id,
        title: "How associations take action on policy",
        videoUrl: "https://www.youtube.com/watch?v=7C2QI4iOU7k",
        durationMin: 5,
        ceEligible: true,
        sortOrder: 1,
      },
    ],
  });

  const program = await db.learnWorkforceProgram.create({
    data: {
      orgId: ORG_ID,
      title: "New grad nurse transition support",
      description: "Illustrative pipeline program — mentorship matching roadmap.",
      programType: "pipeline",
      status: "PUBLISHED",
      eventId: careerFair.id,
    },
  });

  for (let i = 0; i < 5; i++) {
    const m = members[(i * 11) % members.length]!;
    await db.learnProgramEnrollment.create({
      data: {
        orgId: ORG_ID,
        programId: program.id,
        memberId: m.id,
        status: "ENROLLED",
      },
    });
    await db.member.update({
      where: { id: m.id },
      data: {
        workforcePersona: i % 2 === 0 ? "STUDENT" : "NEW_GRAD",
        tags: Array.from(new Set([...m.tags, "workforce-nursing"])),
      },
    });
  }

  await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "Workforce — nursing pipeline (tag)",
      description: "Active members tagged workforce-nursing — Learn Week 1 alpha.",
      filter: { status: "ACTIVE", tag: "workforce-nursing" },
    },
  });

  await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "Workforce — nursing students",
      description: "Members with workforcePersona STUDENT — alpha segment.",
      filter: { status: "ACTIVE", workforcePersona: "STUDENT" },
    },
  });

  await db.emailTemplate.create({
    data: {
      orgId: ORG_ID,
      name: "Workforce — new video library",
      subject: "Explore our nursing & allied health video library",
      bodyText:
        "Hi {firstName},\n\nWe added new workforce videos to help you explore hospital careers. Visit the member library from your portal.\n\n— Sterling Healthcare Association",
      bodyHtml: "",
      approved: true,
    },
  });
}

async function seedGiving(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const pac = await db.campaign.create({
    data: {
      orgId: ORG_ID,
      name: "Hospital Advocacy PAC — 2026",
      description:
        "Voluntary PAC contributions supporting state and federal allies aligned with hospital association priorities.",
      goalCents: 250_000_00,
      status: "ACTIVE",
    },
  });
  const annualFund = await db.campaign.create({
    data: {
      orgId: ORG_ID,
      name: "2026 Annual Fund",
      description:
        "Year-end giving campaign supporting member benefits and chapter grants.",
      goalCents: 5_000_000, // $50,000
      status: "ACTIVE",
    },
  });
  const scholarship = await db.campaign.create({
    data: {
      orgId: ORG_ID,
      name: "New-Grad Scholarship Fund",
      description: "Scholarships for early-career members joining the field.",
      goalCents: 2_500_000,
      status: "ACTIVE",
    },
  });
  await db.campaign.create({
    data: {
      orgId: ORG_ID,
      name: "Capital Campaign 2027 (planning)",
      description: "Pre-launch planning for the 2027 capital campaign.",
      goalCents: 0,
      status: "DRAFT",
    },
  });

  const donationPlan = [
    { campaign: pac, amount: 5_000_00, recurring: false, idx: 2 },
    { campaign: pac, amount: 2_500_00, recurring: false, idx: 8 },
    { campaign: pac, amount: 1_000_00, recurring: true, idx: 15 },
    { campaign: pac, amount: 10_000_00, recurring: false, idx: 6 },
    { campaign: annualFund, amount: 250_00, recurring: false, idx: 4 },
    { campaign: annualFund, amount: 500_00, recurring: true, idx: 11 },
    { campaign: annualFund, amount: 100_00, recurring: false, idx: 17 },
    { campaign: scholarship, amount: 1_000_00, recurring: false, idx: 22 },
    { campaign: scholarship, amount: 50_00, recurring: true, idx: 28 },
    { campaign: annualFund, amount: 75_00, recurring: false, idx: 33 },
    { campaign: annualFund, amount: 1_500_00, recurring: false, idx: 41 },
  ];
  for (const d of donationPlan) {
    const m = members[d.idx % members.length]!;
    await db.donation.create({
      data: {
        orgId: ORG_ID,
        campaignId: d.campaign.id,
        memberId: m.id,
        donorName: `${m.firstName} ${m.lastName}`,
        donorEmail: m.email,
        amountCents: d.amount,
        currency: "usd",
        recurring: d.recurring,
        paidAt: new Date(),
      },
    });
  }
}

async function seedCommerce(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const dues = await db.commerceProduct.create({
    data: {
      orgId: ORG_ID,
      sku: "DUES-2026-INDIVIDUAL",
      name: "2026 Individual Membership Dues",
      description: "Annual dues for individual members.",
      kind: "DUES",
      priceCents: 12500,
      currency: "usd",
      glCode: "4000-DUES",
      active: true,
    },
  });
  const merch = await db.commerceProduct.create({
    data: {
      orgId: ORG_ID,
      sku: "MERCH-LANYARD-001",
      name: "Conference Lanyard (set of 5)",
      description: "Branded lanyards for chapter events.",
      kind: "MERCHANDISE",
      priceCents: 1500,
      currency: "usd",
      glCode: "4200-MERCH",
      active: true,
    },
  });
  const sponsorship = await db.commerceProduct.create({
    data: {
      orgId: ORG_ID,
      sku: "SPONSOR-GOLD-2026",
      name: "Spring Conference — Gold Sponsorship",
      description: "Premium booth + program ad + welcome remarks.",
      kind: "SPONSORSHIP",
      priceCents: 750000,
      currency: "usd",
      glCode: "4500-SPONSOR",
      active: true,
    },
  });
  await db.commerceProduct.create({
    data: {
      orgId: ORG_ID,
      sku: "DUES-2026-ORG",
      name: "2026 Organizational Membership Dues",
      description: "Annual dues for organizational members.",
      kind: "DUES",
      priceCents: 45000,
      currency: "usd",
      glCode: "4000-DUES",
      active: true,
    },
  });

  await db.commerceProduct.create({
    data: {
      orgId: ORG_ID,
      sku: "DUES-2026-STUDENT",
      name: "2026 Student Membership Dues",
      description: "Reduced student rate (inactive — replaced by 2026 plan).",
      kind: "DUES",
      priceCents: 4500,
      currency: "usd",
      glCode: "4000-DUES",
      active: false,
    },
  });

  // Paid + pending dues orders — home dashboard unpaid-invoice tracking.
  const orders: Array<{
    productId: string;
    qty: number;
    status: "PAID" | "PENDING";
    memberIdx: number;
  }> = [
    { productId: dues.id, qty: 1, status: "PAID", memberIdx: 5 },
    { productId: dues.id, qty: 1, status: "PENDING", memberIdx: 8 },
    { productId: dues.id, qty: 1, status: "PENDING", memberIdx: 12 },
    { productId: merch.id, qty: 3, status: "PAID", memberIdx: 18 },
    { productId: sponsorship.id, qty: 1, status: "PENDING", memberIdx: 27 },
  ];
  for (const o of orders) {
    const m = members[o.memberIdx % members.length]!;
    const product =
      o.productId === dues.id ? dues : o.productId === merch.id ? merch : sponsorship;
    const total = product.priceCents * o.qty;
    await db.commerceOrder.create({
      data: {
        orgId: ORG_ID,
        memberId: m.id,
        status: o.status,
        totalCents: total,
        currency: product.currency,
        paymentAdapterId: o.status === "PAID" ? "manual" : null,
        paidAt: o.status === "PAID" ? new Date() : null,
        items: {
          create: [
            {
              orgId: ORG_ID,
              productId: product.id,
              quantity: o.qty,
              priceCents: product.priceCents,
            },
          ],
        },
      },
    });
  }
}

async function seedEngage() {
  const db = getOrgDb(ORG_ID);

  const welcome = await db.emailTemplate.create({
    data: {
      orgId: ORG_ID,
      name: "Welcome New Member",
      subject: "Welcome to Sterling Healthcare Association",
      bodyText:
        "Hi {firstName},\n\nThanks for joining Sterling Healthcare Association. Your member portal is live at {portalUrl}.\n\n— The team",
      bodyHtml: "",
      approved: true,
    },
  });
  await db.emailTemplate.create({
    data: {
      orgId: ORG_ID,
      name: "Renewal Reminder (60-day)",
      subject: "Your membership renews in 60 days",
      bodyText:
        "Hi {firstName},\n\nYour membership renews on {renewalDate}. Renew anytime from your member portal.\n\n— The team",
      bodyHtml: "",
      approved: true,
    },
  });
  await db.emailTemplate.create({
    data: {
      orgId: ORG_ID,
      name: "Issue alert — advocacy topic (alpha)",
      subject: "Action needed: {issueTitle} — hospital sign-on",
      bodyText:
        "Hi {firstName},\n\nOur association published an update on {issueTitle}. Review the member toolkit and submit your hospital sign-on when ready.\n\nMember page: {issueUrl}\n\n— Sterling Healthcare Association advocacy team",
      bodyHtml: "",
      approved: true,
    },
  });

  const allActive = await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "All active members",
      description: "Every member with status = ACTIVE.",
      filter: { status: "ACTIVE" },
    },
  });
  await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "Lapsed members (re-engagement)",
      description: "Members with LAPSED status — for renewal pushes.",
      filter: { status: "LAPSED" },
    },
  });
  await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "Board only",
      description: "Members tagged 'board'.",
      filter: { tag: "board" },
    },
  });

  // One historical campaign with send logs so the table isn't empty.
  const campaign = await db.emailCampaign.create({
    data: {
      orgId: ORG_ID,
      templateId: welcome.id,
      audienceId: allActive.id,
      status: "SENT",
      sentAt: daysFromNow(-3, 10),
    },
  });
  for (let i = 0; i < 5; i++) {
    await db.emailSendLog.create({
      data: {
        orgId: ORG_ID,
        campaignId: campaign.id,
        recipient: `seed.recipient.${i}@demo-healthcare.example`,
        subject: welcome.subject,
        adapterId: "log",
        result: "skipped",
        providerId: null,
      },
    });
  }

  const seqCount = await db.emailSequence.count();
  if (seqCount === 0) {
    for (const t of EMAIL_SEQUENCE_TEMPLATES.slice(0, 2)) {
      await db.emailSequence.create({
        data: {
          orgId: ORG_ID,
          name: t.name,
          description: t.description,
          fromTemplate: t.key,
          status: "ACTIVE",
          steps: {
            create: t.steps.map((s) => ({
              orgId: ORG_ID,
              stepOrder: s.stepOrder,
              delayDays: s.delayDays,
              subject: s.subject,
              bodyText: s.bodyText,
            })),
          },
        },
      });
    }
  }
}

async function seedInsights() {
  const db = getOrgDb(ORG_ID);

  // Two snapshots so the trend column has more than one row.
  const yesterday = daysFromNow(-1, 18);
  const today = new Date();
  await db.insightsSnapshot.createMany({
    data: [
      { orgId: ORG_ID, metricKey: "members.active", value: 36, unit: "count", takenAt: yesterday },
      { orgId: ORG_ID, metricKey: "events.published", value: 2, unit: "count", takenAt: yesterday },
      { orgId: ORG_ID, metricKey: "revenue.commerce", value: 170, unit: "usd", takenAt: yesterday },
      { orgId: ORG_ID, metricKey: "revenue.giving", value: 3475, unit: "usd", takenAt: yesterday },
      { orgId: ORG_ID, metricKey: "ops.open_exceptions", value: 2, unit: "count", takenAt: yesterday },

      { orgId: ORG_ID, metricKey: "members.active", value: 36, unit: "count", takenAt: today },
      { orgId: ORG_ID, metricKey: "events.published", value: 2, unit: "count", takenAt: today },
      { orgId: ORG_ID, metricKey: "revenue.commerce", value: 170, unit: "usd", takenAt: today },
      { orgId: ORG_ID, metricKey: "revenue.giving", value: 3475, unit: "usd", takenAt: today },
      { orgId: ORG_ID, metricKey: "ops.open_exceptions", value: 2, unit: "count", takenAt: today },
    ],
  });
}

async function seedPlatformCapabilities(
  events: {
    upcomingPaid: { id: string; startsAt: Date };
    upcomingFree: { id: string; startsAt: Date };
  },
  members: SeededMember[],
) {
  const db = getOrgDb(ORG_ID);

  const individualDues = await db.commerceProduct.findFirst({
    where: { orgId: ORG_ID, sku: "DUES-2026-INDIVIDUAL" },
  });
  const orgDues = await db.commerceProduct.findFirst({
    where: { orgId: ORG_ID, sku: "DUES-2026-ORG" },
  });

  const individual = await db.memberTier.create({
    data: {
      orgId: ORG_ID,
      name: "General Membership",
      priceCents: 17500,
      billingInterval: "ANNUAL",
      productId: individualDues?.id ?? null,
    },
  });
  const orgTier = await db.memberTier.create({
    data: {
      orgId: ORG_ID,
      name: "Associate Membership",
      priceCents: 8500,
      billingInterval: "ANNUAL",
      productId: orgDues?.id ?? null,
    },
  });

  await db.renewalWorkflow.create({
    data: {
      orgId: ORG_ID,
      name: "Standard annual renewal",
      description: "Email reminders → dues checkout → welcome back",
      tierId: individual.id,
      active: true,
      steps: [
        { id: "profile", order: 0, type: "profile", label: "Your information" },
        { id: "dues", order: 1, type: "dues", label: "Select membership tier" },
        { id: "terms", order: 2, type: "terms", label: "Membership terms" },
        { id: "payment", order: 3, type: "payment", label: "Pay dues" },
        { id: "welcome", order: 4, type: "welcome", label: "Welcome back" },
      ],
    },
  });

  for (let i = 0; i < 8; i++) {
    const m = members[i]!;
    await db.member.update({
      where: { id: m.id },
      data: {
        tierId: i % 2 === 0 ? individual.id : orgTier.id,
        renewalDueAt: daysFromNow(20 + i * 7),
        engagementScore: 40 + i * 7,
        engagementTier: i > 4 ? "active" : i > 2 ? "moderate" : "at_risk",
      },
    });
    if (i < 3) {
      await db.memberBadge.create({
        data: {
          orgId: ORG_ID,
          memberId: m.id,
          code: "event-attendee",
          label: "Event attendee",
        },
      });
    }
  }

  for (let i = 8; i < 14; i++) {
    const m = members[i]!;
    await db.member.update({
      where: { id: m.id },
      data: {
        tierId: i % 2 === 0 ? individual.id : orgTier.id,
        renewalDueAt: daysFromNow(-3 - (i - 8) * 5),
        engagementTier: "at_risk",
      },
    });
  }

  const speakerMembers = members.slice(0, 4);
  await db.eventSpeaker.createMany({
    data: [
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        memberId: speakerMembers[0]?.id,
        name: "Dr. Elena Chen",
        title: "Chief Clinical Officer, Metro Health",
        organizationName: "Metro Health System",
        bio: "National voice on quality measurement and patient safety.",
        role: "KEYNOTE",
        sortOrder: 0,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        memberId: speakerMembers[1]?.id,
        name: "James Okonkwo",
        title: "VP Nursing Excellence",
        organizationName: "Sterling Healthcare Association",
        role: "PANELIST",
        sortOrder: 1,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        memberId: speakerMembers[2]?.id,
        name: "Dr. Priya Patel",
        title: "Director, Population Health",
        organizationName: "North River Health Plan",
        role: "SPEAKER",
        sortOrder: 2,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        memberId: speakerMembers[3]?.id,
        name: "Marcus Hall",
        title: "Moderator",
        organizationName: "Healthcare Leadership Forum",
        role: "MODERATOR",
        sortOrder: 3,
      },
    ],
  });

  await db.eventSponsor.createMany({
    data: [
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        name: "Sterling Medical Group",
        tier: "Platinum",
        amountCents: 2500000,
        sortOrder: 0,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        name: "North River Health Plan",
        tier: "Gold",
        amountCents: 1000000,
        sortOrder: 1,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        name: "Summit CE Partners",
        tier: "Silver",
        amountCents: 500000,
        sortOrder: 2,
      },
    ],
  });

  const summitStart = events.upcomingPaid.startsAt;
  await db.eventSession.createMany({
    data: [
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        title: "Opening keynote — Leading through change",
        startsAt: summitStart,
        room: "Grand Ballroom",
        track: "Leadership",
        sortOrder: 0,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        title: "Workforce resilience workshop",
        startsAt: daysFromNow(42, 10),
        room: "Harbor A",
        track: "Workforce",
        sortOrder: 1,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        title: "Quality metrics that matter",
        startsAt: daysFromNow(42, 14),
        room: "Harbor B",
        track: "Quality",
        sortOrder: 2,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        title: "Closing panel — What's next for clinical leaders",
        startsAt: daysFromNow(43, 15),
        room: "Grand Ballroom",
        track: "Leadership",
        sortOrder: 3,
      },
    ],
  });

  await db.eventTicketType.createMany({
    data: [
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        name: "Member early bird",
        description: "Discounted rate for active members.",
        priceCents: 24500,
        capacity: 80,
        sortOrder: 0,
        active: true,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        name: "Non-member",
        description: "Standard registration.",
        priceCents: 29500,
        capacity: 40,
        sortOrder: 1,
        active: true,
      },
      {
        orgId: ORG_ID,
        eventId: events.upcomingPaid.id,
        name: "VIP reception add-on",
        description: "Evening sponsor reception.",
        priceCents: 7500,
        capacity: 30,
        sortOrder: 2,
        active: true,
      },
    ],
  });

  const boardSpace = await db.communitySpace.create({
    data: {
      orgId: ORG_ID,
      name: "Board of Directors",
      slug: "board",
      description: "Private space for board materials and discussion.",
      visibility: "PRIVATE",
    },
  });

  const financeSpace = await db.communitySpace.create({
    data: {
      orgId: ORG_ID,
      name: "Finance Committee",
      slug: "finance-committee",
      description: "Budget drafts, audit prep, and treasurer updates.",
      visibility: "PRIVATE",
    },
  });

  const chapterEast = await db.communitySpace.create({
    data: {
      orgId: ORG_ID,
      name: "Chapter East",
      slug: "chapter-east",
      description: "Regional chapter — events, networking, and local advocacy.",
      visibility: "MEMBERS_ONLY",
    },
  });

  const spaces = [boardSpace, financeSpace, chapterEast];
  for (const space of spaces) {
    for (let i = 0; i < 5; i++) {
      await db.communityMembership.create({
        data: {
          orgId: ORG_ID,
          spaceId: space.id,
          memberId: members[i]!.id,
          role: i === 0 ? "ADMIN" : "MEMBER",
        },
      });
    }
  }

  await db.communityDocument.createMany({
    data: [
      {
        orgId: ORG_ID,
        spaceId: boardSpace.id,
        title: "Q4 Board packet (PDF)",
        url: "https://www.haponline.org/resource/example-board-packet",
      },
      {
        orgId: ORG_ID,
        spaceId: boardSpace.id,
        title: "Governance policies — trustee orientation",
        url: "https://www.haponline.org/resource/example-governance",
      },
      {
        orgId: ORG_ID,
        spaceId: financeSpace.id,
        title: "FY26 audit timeline (draft)",
        url: "https://www.haponline.org/resource/example-audit-timeline",
      },
      {
        orgId: ORG_ID,
        spaceId: financeSpace.id,
        title: "Dues revenue forecast worksheet",
        url: "https://www.haponline.org/resource/example-dues-forecast",
      },
      {
        orgId: ORG_ID,
        spaceId: chapterEast.id,
        title: "Chapter East — spring networking agenda",
        url: "https://www.haponline.org/resource/example-chapter-agenda",
      },
    ],
  });

  await db.communityPost.createMany({
    data: [
      {
        orgId: ORG_ID,
        spaceId: boardSpace.id,
        title: "Q4 board packet posted",
        body: "Agenda and financial summary are ready for Friday's call. Please review the dues forecast slide before we gavel in.",
      },
      {
        orgId: ORG_ID,
        spaceId: boardSpace.id,
        title: "Governance training reminder",
        body: "New trustees: complete the 30-minute governance module in Learn before the January retreat.",
      },
      {
        orgId: ORG_ID,
        spaceId: financeSpace.id,
        title: "Audit timeline draft",
        body: "Finance committee — please comment on the attached timeline for external audit fieldwork (March window).",
      },
      {
        orgId: ORG_ID,
        spaceId: chapterEast.id,
        title: "Spring networking save the date",
        body: "Chapter East is planning a regional meet-up in April. Reply with venue ideas in Philadelphia or Harrisburg.",
      },
    ],
  });

  await db.communityDocument.createMany({
    data: [
      {
        orgId: ORG_ID,
        spaceId: boardSpace.id,
        title: "Board roster 2026",
        url: "https://demo-healthcare.example/docs/board-roster.pdf",
      },
      {
        orgId: ORG_ID,
        spaceId: financeSpace.id,
        title: "FY26 budget workbook",
        url: "https://demo-healthcare.example/docs/fy26-budget.xlsx",
      },
      {
        orgId: ORG_ID,
        spaceId: chapterEast.id,
        title: "Chapter East event checklist",
        url: "https://demo-healthcare.example/docs/chapter-east-events.pdf",
      },
    ],
  });

  await db.reportSchedule.create({
    data: {
      orgId: ORG_ID,
      name: "Board KPI pack (automated)",
      metricKeys: [
        "revenue.total",
        "revenue.dues",
        "members.active",
        "members.renewal_due_30",
        "membership.retention_pct",
        "events.registrations",
      ],
      cadence: "MONTHLY",
      recipients: ["finance@demo-healthcare.example", "board@demo-healthcare.example"],
      nextRunAt: daysFromNow(1),
      active: true,
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

async function seedEnterpriseAssociation(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);

  const generalTier = await db.memberTier.findFirst({
    where: { orgId: ORG_ID, name: { contains: "General" } },
  });

  const facilityDefs: Array<{
    name: string;
    type:
      | "HEALTH_NETWORK"
      | "HEALTH_SYSTEM"
      | "HOSPITAL"
      | "CRITICAL_ACCESS"
      | "CANCER_CENTER"
      | "PSYCHIATRIC_CENTER"
      | "PSYCHIATRIC_INSTITUTE"
      | "BEHAVIORAL_HEALTH_CENTER"
      | "REHABILITATION_CENTER";
    region: string;
    bedCount?: number;
    parentKey?: string;
  }> = [
    { name: "Keystone Health Network", type: "HEALTH_NETWORK", region: "Central PA", bedCount: 2400 },
    { name: "Metro Health System", type: "HEALTH_SYSTEM", region: "Southeast PA", bedCount: 1200 },
    { name: "North River Community Hospital", type: "HOSPITAL", region: "Southeast PA", bedCount: 320, parentKey: "metro" },
    { name: "Lancaster General Hospital", type: "HOSPITAL", region: "South Central PA", bedCount: 580 },
    { name: "Valley Critical Access Hospital", type: "CRITICAL_ACCESS", region: "Central PA", bedCount: 25 },
    { name: "Hope Regional Cancer Center", type: "CANCER_CENTER", region: "Northeast PA", bedCount: 0 },
    { name: "Summit Psychiatric Center", type: "PSYCHIATRIC_CENTER", region: "Southeast PA", bedCount: 120 },
    { name: "Commonwealth Psychiatric Institute", type: "PSYCHIATRIC_INSTITUTE", region: "Philadelphia", bedCount: 90 },
    { name: "Riverbend Behavioral Health Center", type: "BEHAVIORAL_HEALTH_CENTER", region: "Western PA", bedCount: 64 },
    { name: "Pinecrest Rehabilitation Center", type: "REHABILITATION_CENTER", region: "Central PA", bedCount: 110 },
    { name: "Allegheny Rehabilitation Hospital", type: "REHABILITATION_CENTER", region: "Western PA", bedCount: 140 },
  ];

  const parentByKey = new Map<string, string>();
  const facilities: { id: string; type: string }[] = [];

  for (const def of facilityDefs) {
    const parentId =
      def.parentKey === "metro" ? parentByKey.get("metro") : undefined;
    const created = await db.memberOrganization.create({
      data: {
        orgId: ORG_ID,
        name: def.name,
        type: def.type,
        region: def.region,
        bedCount: def.bedCount ?? null,
        ownership: "NONPROFIT",
        parentId: parentId ?? null,
        membershipLevel: "Standard",
        participationLevel: "Active",
      },
    });
    facilities.push({ id: created.id, type: def.type });
    if (def.name === "Metro Health System") {
      parentByKey.set("metro", created.id);
    }
  }

  const memberRows = await db.member.findMany({
    where: { orgId: ORG_ID, id: { in: members.map((m) => m.id) } },
    select: { id: true, tierId: true, status: true },
  });

  const metroId = facilities.find(
    (_, i) => facilityDefs[i]!.name === "Metro Health System",
  )?.id;
  const valleyId = facilities.find(
    (_, i) => facilityDefs[i]!.name === "Valley Critical Access Hospital",
  )?.id;

  let facilityIdx = 0;
  for (const row of memberRows) {
    if (row.status !== "ACTIVE") continue;
    const isGeneral = generalTier ? row.tierId === generalTier.id : false;
    if (!isGeneral) continue;
    const facility = facilities[facilityIdx % facilities.length]!;
    facilityIdx += 1;
    await db.member.update({
      where: { id: row.id },
      data: { organizationAccountId: facility.id },
    });
  }

  const policyCommittee = await db.committee.create({
    data: {
      orgId: ORG_ID,
      name: "Government Affairs Committee",
      kind: "STANDING",
      departmentId: "advocacy",
      description: "Sets legislative priorities for the association.",
    },
  });

  const qualityCouncil = await db.committee.create({
    data: {
      orgId: ORG_ID,
      name: "Quality & Patient Safety Council",
      kind: "COUNCIL",
      departmentId: "quality_initiatives",
    },
  });

  await db.committeeMembership.create({
    data: {
      orgId: ORG_ID,
      committeeId: policyCommittee.id,
      memberId: members[2]!.id,
      title: "Chair",
      officerRole: "CHAIR",
      isCurrent: true,
    },
  });
  await db.committeeMembership.create({
    data: {
      orgId: ORG_ID,
      committeeId: policyCommittee.id,
      memberId: members[3]!.id,
      title: "Secretary",
      officerRole: "SECRETARY",
      isCurrent: true,
    },
  });
  await db.committeeMembership.create({
    data: {
      orgId: ORG_ID,
      committeeId: qualityCouncil.id,
      memberId: members[4]!.id,
      title: "Chair",
      officerRole: "CHAIR",
      isCurrent: true,
    },
  });
  await db.committeeMembership.create({
    data: {
      orgId: ORG_ID,
      committeeId: qualityCouncil.id,
      memberId: members[5]!.id,
      title: "Member",
      officerRole: "MEMBER",
      isCurrent: true,
    },
  });

  const meetingStart = new Date();
  meetingStart.setDate(meetingStart.getDate() + 14);
  meetingStart.setHours(10, 0, 0, 0);
  const meetingEnd = new Date(meetingStart);
  meetingEnd.setHours(11, 30, 0, 0);

  await db.committeeMeeting.create({
    data: {
      orgId: ORG_ID,
      committeeId: policyCommittee.id,
      title: "Legislative priorities briefing",
      startsAt: meetingStart,
      endsAt: meetingEnd,
      location: "HAP Conference Center",
      virtualUrl: "https://teams.microsoft.com/l/meet/demo",
      agenda: "Review 340B and workforce priorities for Q3 advocacy.",
      status: "SCHEDULED",
    },
  });

  const issue340b = await db.advocacyIssue.create({
    data: {
      orgId: ORG_ID,
      title: "340B program integrity protections",
      summary: "Oppose restrictions on contract pharmacy arrangements for member hospitals.",
      jurisdiction: "FEDERAL",
      status: "ACTIVE",
      billNumber: "H.R. demo-340b",
      departmentId: "policy",
      issueArea: "ACCESS_TO_CARE",
      publicSlug: "access-to-care",
      contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
    },
  });

  const advocacyTemplateSeeds = [
    {
      slug: "nursing-workforce",
      area: "NURSING_WORKFORCE" as const,
      title: "Nursing workforce — pipeline and retention",
      summary:
        "Illustrative: Pipeline programs, retention incentives, and transition support for new nurses at member hospitals.",
      status: "ACTIVE" as const,
    },
    {
      slug: "workplace-violence",
      area: "WORKPLACE_VIOLENCE" as const,
      title: "Workplace violence — hospital staff safety",
      summary:
        "Illustrative: Legislative toolkits, reporting workflows, and training requirements for member facilities.",
      status: "ACTIVE" as const,
    },
    {
      slug: "maternal-health",
      area: "MATERNAL_HEALTH" as const,
      title: "Maternal health — education and workforce",
      summary:
        "Illustrative: Coalition campaigns on mortality prevention and perinatal education.",
      status: "TRACKING" as const,
    },
  ];

  const seededIssues: Record<string, { id: string }> = {};

  for (const t of advocacyTemplateSeeds) {
    const row = await db.advocacyIssue.create({
      data: {
        orgId: ORG_ID,
        title: t.title,
        summary: t.summary,
        jurisdiction: "STATE",
        status: t.status,
        departmentId: "advocacy",
        issueArea: t.area,
        publicSlug: t.slug,
        contentMeta: { validationStatus: "illustrative_only", source: "quake-os-healthcare-sme" },
      },
    });
    seededIssues[t.slug] = { id: row.id };
  }

  const hospitalAccountCount = await db.memberOrganization.count({ where: { orgId: ORG_ID } });

  const takeActionAudience = await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "Hospital executives — take-action (340B)",
      description: "Launched from Spring grassroots hospital sign-on campaign.",
      filter: { tag: "hospital-executive" },
    },
  });

  const springCampaign = await db.advocacyCampaign.create({
    data: {
      orgId: ORG_ID,
      issueId: issue340b.id,
      name: "Spring grassroots hospital sign-on",
      isActive: true,
      audienceId: takeActionAudience.id,
      targetCount: hospitalAccountCount,
      responseCount: Math.min(42, hospitalAccountCount),
    },
  });

  const nursingTakeActionAudience = await db.emailAudience.create({
    data: {
      orgId: ORG_ID,
      name: "Hospital executives — nursing workforce sign-on",
      description: "Launched from nursing workforce take-action campaign (alpha demo).",
      filter: { tag: "hospital-executive" },
    },
  });

  await db.advocacyCampaign.create({
    data: {
      orgId: ORG_ID,
      issueId: seededIssues["nursing-workforce"]!.id,
      name: "Nursing pipeline — hospital sign-on (demo)",
      isActive: true,
      audienceId: nursingTakeActionAudience.id,
      targetCount: hospitalAccountCount,
      responseCount: Math.min(12, hospitalAccountCount),
    },
  });

  await db.advocacyCampaign.create({
    data: {
      orgId: ORG_ID,
      issueId: seededIssues["workplace-violence"]!.id,
      name: "Staff safety — hospital toolkit sign-on (demo)",
      isActive: true,
      targetCount: hospitalAccountCount,
      responseCount: Math.min(8, hospitalAccountCount),
    },
  });

  await db.advocacyCampaign.create({
    data: {
      orgId: ORG_ID,
      name: "Medicaid supplemental payment awareness",
      isActive: true,
      targetCount: hospitalAccountCount,
      responseCount: Math.min(18, hospitalAccountCount),
    },
  });

  if (metroId) {
    await db.advocacyCampaignResponse.create({
      data: {
        orgId: ORG_ID,
        campaignId: springCampaign.id,
        memberOrganizationId: metroId,
        hospitalName: "Metro General Hospital",
        responderName: "Alex Morgan",
        responderEmail: "alex.morgan@metro-health.example",
        responderTitle: "CEO",
        position: "SUPPORT",
      },
    });
  }

  await db.emergencyContact.createMany({
    data: [
      {
        orgId: ORG_ID,
        memberOrganizationId: metroId!,
        roleTitle: "Emergency Preparedness Coordinator",
        phone: "+1-555-0100",
        email: "epc@metro-health.example",
        isPrimary: true,
        region: "Southeast",
        specialty: "OPERATIONS",
      },
      {
        orgId: ORG_ID,
        memberOrganizationId: valleyId!,
        roleTitle: "Cyber Incident Lead",
        phone: "+1-555-0101",
        region: "Central",
        specialty: "CYBER",
      },
    ],
  });

  await db.emergencyReadinessReport.create({
    data: {
      orgId: ORG_ID,
      memberOrganizationId: metroId!,
      readinessScore: 82,
      notes: "Quarterly hospital readiness attestation on file.",
      submittedBy: "demo-owner",
    },
  });

  await db.integrationConnection.createMany({
    data: [
      {
        orgId: ORG_ID,
        vendor: "STRIPE",
        status: "CONFIGURED",
        config: { mode: "test" },
      },
      {
        orgId: ORG_ID,
        vendor: "CLERK",
        status: "CONFIGURED",
        config: { mode: "demo" },
      },
      {
        orgId: ORG_ID,
        vendor: "RESEND",
        status: "PENDING",
        config: {},
      },
      {
        orgId: ORG_ID,
        vendor: "MICROSOFT_365",
        status: "PENDING",
        config: { profile: "hap-azure-planned" },
      },
      {
        orgId: ORG_ID,
        vendor: "POWER_BI",
        status: "PENDING",
        config: { export: "pnpm continuity:export" },
      },
    ],
  });
}

async function seedMemberPulse(members: SeededMember[]) {
  const db = getOrgDb(ORG_ID);
  console.log(`  Computing MemberPulse for ${members.length} members…`);
  for (const m of members) {
    const pulse = await computeMemberPulse(ORG_ID, m.id);
    if (!pulse) continue;
    await db.member.update({
      where: { id: m.id },
      data: {
        memberPulseData: pulse as unknown as Prisma.InputJsonValue,
        engagementScore: pulse.overall,
        engagementTier: pulse.overallTier,
      },
    });
  }
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

  console.log("Seeding member leadership & board roles…");
  await seedMemberRoles(members);

  console.log("Seeding PulsePoint CRM (relationships, sources, workflows)…");
  await seedCrm(members);

  console.log("Seeding PulsePoint Deals (pipelines, deals, report dashboards)…");
  await seedDeals();

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

  console.log("Seeding Learn (credit types, courses, awards)…");
  await seedLearn(members);

  console.log("Seeding Learn workforce (career fair, playlists, programs)…");
  await seedWorkforce(members);

  console.log("Seeding Giving (campaigns, donations)…");
  await seedGiving(members);

  console.log("Seeding Commerce (products, orders)…");
  await seedCommerce(members);

  console.log("Seeding Engage (templates, audiences, send log)…");
  await seedEngage();

  console.log("Seeding Insights snapshots…");
  await seedInsights();

  console.log("Seeding platform capabilities (360, renewals, conference, communities)…");
  await seedPlatformCapabilities(events, members);

  console.log("Seeding enterprise association (orgs, committees, advocacy, emergency)…");
  await seedEnterpriseAssociation(members);

  console.log("Computing MemberPulse engagement scores…");
  await seedMemberPulse(members);

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
