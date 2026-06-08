/**
 * PulsePoint AMS — demo seed.
 *
 * WHO THIS IS FOR: developers/demo operators booting a local stack.
 * WHAT IT DOES: idempotently seeds users, error runbooks, metric definitions,
 *   and five demo campaigns that together exercise every UI module — DRAFT,
 *   READY_TO_TRAFFIC (with and without failed sync), SYNCED (with pacing
 *   alert), LIVE (with reconciliation + reporting), and a draft refresh.
 * HOW IT CONNECTS: writes against the Prisma schema in this directory and
 *   pulls metric/runbook definitions from @ams/shared.
 *
 * Idempotency: all writes go through `upsert` keyed on unique fields, or
 *   `findFirst` -> create. Re-running the script is safe.
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { ERROR_RUNBOOKS, METRIC_REGISTRY } from "@ams/shared";

const prisma = new PrismaClient();

// Stable UUIDs so re-running seed is fully idempotent and so cross-table
// references (campaign -> creatives/audits/etc.) line up on every run.
const IDS = {
  users: {
    ops: "00000000-0000-4000-8000-000000000001",
    traffic: "00000000-0000-4000-8000-000000000002",
    mlr: "00000000-0000-4000-8000-000000000003",
    viewer: "00000000-0000-4000-8000-000000000004",
    admin: "00000000-0000-4000-8000-000000000005",
  },
  campaigns: {
    live: "10000000-0000-4000-8000-000000000001",
    synced: "10000000-0000-4000-8000-000000000002",
    ready: "10000000-0000-4000-8000-000000000003",
    draft: "10000000-0000-4000-8000-000000000004",
    failedSync: "10000000-0000-4000-8000-000000000005",
  },
  amsUuids: {
    live: "20000000-0000-4000-8000-000000000001",
    synced: "20000000-0000-4000-8000-000000000002",
    ready: "20000000-0000-4000-8000-000000000003",
    draft: "20000000-0000-4000-8000-000000000004",
    failedSync: "20000000-0000-4000-8000-000000000005",
  },
};

const SEED_TAG = "seed:v1";

/** Eight Luhn-valid NPIs for demo audiences (CMS prefix 80840 + Luhn).
 *  Plain identifiers only — no PHI.
 */
const DEMO_NPIS = [
  "1234567893",
  "1245319599",
  "1356789013",
  "1467890124",
  "1578901235",
  "1689012347",
  "1790123458",
  "1801234569",
];

async function seedRunbooks() {
  let count = 0;
  for (const [code, book] of Object.entries(ERROR_RUNBOOKS)) {
    await prisma.errorRunbook.upsert({
      where: { code },
      create: { code, title: book.title, message: book.message, steps: book.steps },
      update: { title: book.title, message: book.message, steps: book.steps },
    });
    count++;
  }
  return count;
}

async function seedMetrics() {
  let count = 0;
  for (const m of METRIC_REGISTRY) {
    await prisma.metricDefinition.upsert({
      where: { key: m.key },
      create: {
        key: m.key,
        label: m.label,
        owner: m.owner,
        timezone: m.timezone,
        includesFees: m.includesFees,
        pulsepointField: m.pulsepointField,
        description: m.description,
      },
      update: {
        label: m.label,
        owner: m.owner,
        timezone: m.timezone,
        includesFees: m.includesFees,
        pulsepointField: m.pulsepointField,
        description: m.description,
      },
    });
    count++;
  }
  return count;
}

async function seedUsers() {
  const users = [
    { id: IDS.users.ops, email: "ops@example.com", name: "Ops Lead", role: "OPS_LEAD" as const },
    { id: IDS.users.traffic, email: "traffic@example.com", name: "Trafficker", role: "TRAFFICKER" as const },
    { id: IDS.users.mlr, email: "mlr@example.com", name: "MLR Reviewer", role: "MLR_REVIEWER" as const },
    { id: IDS.users.viewer, email: "viewer@example.com", name: "Viewer", role: "VIEWER" as const },
    { id: IDS.users.admin, email: "admin@example.com", name: "Admin", role: "ADMIN" as const },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: { id: u.id, name: u.name, role: u.role },
    });
  }
  return users.length;
}

interface CampaignSeed {
  id: string;
  amsUuid: string;
  name: string;
  clientName: string;
  state: "DRAFT" | "QA" | "APPROVED" | "READY_TO_TRAFFIC" | "SYNCED" | "LIVE" | "OPTIMIZING" | "COMPLETED" | "ARCHIVED";
  budgetUsd: number;
  flightStart: string;
  flightEnd: string;
  pulsepointId: string | null;
  audienceQa: boolean;
  budgetQa: boolean;
  creativeQa: boolean;
}

const CAMPAIGNS: CampaignSeed[] = [
  {
    id: IDS.campaigns.live,
    amsUuid: IDS.amsUuids.live,
    name: "Demo HCP Awareness Q2 2026",
    clientName: "Aurora Pharma",
    state: "LIVE",
    budgetUsd: 250000,
    flightStart: "2026-04-01",
    flightEnd: "2026-06-30",
    pulsepointId: "PP-DEMO-12345",
    audienceQa: true,
    budgetQa: true,
    creativeQa: true,
  },
  {
    id: IDS.campaigns.synced,
    amsUuid: IDS.amsUuids.synced,
    name: "Cardiology Education Series",
    clientName: "Helix Cardio",
    state: "SYNCED",
    budgetUsd: 180000,
    flightStart: "2026-05-15",
    flightEnd: "2026-08-15",
    pulsepointId: "PP-DEMO-23456",
    audienceQa: true,
    budgetQa: true,
    creativeQa: true,
  },
  {
    id: IDS.campaigns.ready,
    amsUuid: IDS.amsUuids.ready,
    name: "Oncology Specialist Outreach",
    clientName: "BetaMed",
    state: "READY_TO_TRAFFIC",
    budgetUsd: 420000,
    flightStart: "2026-06-01",
    flightEnd: "2026-09-30",
    pulsepointId: null,
    audienceQa: true,
    budgetQa: true,
    creativeQa: true,
  },
  {
    id: IDS.campaigns.draft,
    amsUuid: IDS.amsUuids.draft,
    name: "Q3 Diabetes Awareness (Draft)",
    clientName: "Aurora Pharma",
    state: "DRAFT",
    budgetUsd: 95000,
    flightStart: "2026-07-01",
    flightEnd: "2026-09-30",
    pulsepointId: null,
    audienceQa: false,
    budgetQa: false,
    creativeQa: false,
  },
  {
    id: IDS.campaigns.failedSync,
    amsUuid: IDS.amsUuids.failedSync,
    name: "Pediatric Vaccine Campaign (Failed Sync)",
    clientName: "Helix Cardio",
    state: "READY_TO_TRAFFIC",
    budgetUsd: 140000,
    flightStart: "2026-06-15",
    flightEnd: "2026-09-15",
    pulsepointId: null,
    audienceQa: true,
    budgetQa: true,
    creativeQa: true,
  },
];

async function seedCampaigns() {
  const qaTs = new Date("2026-03-25T15:00:00Z");
  for (const c of CAMPAIGNS) {
    const data = {
      id: c.id,
      amsUuid: c.amsUuid,
      name: c.name,
      clientName: c.clientName,
      state: c.state,
      budgetUsd: c.budgetUsd,
      flightStart: new Date(c.flightStart + "T00:00:00Z"),
      flightEnd: new Date(c.flightEnd + "T00:00:00Z"),
      pulsepointId: c.pulsepointId,
      audienceQaAt: c.audienceQa ? qaTs : null,
      budgetQaAt: c.budgetQa ? qaTs : null,
      creativeQaAt: c.creativeQa ? qaTs : null,
    };
    await prisma.campaign.upsert({
      where: { id: c.id },
      create: data,
      update: data,
    });
  }
  return CAMPAIGNS.length;
}

interface CreativeSpec {
  id: string;
  campaignId: string;
  name: string;
  state: "DRAFT" | "SUBMITTED" | "MLR_APPROVED" | "LOCKED" | "TRAFFICKED" | "LIVE" | "RETIRED";
  pulsepointTagId?: string | null;
}

const CREATIVES: CreativeSpec[] = [
  // LIVE campaign — 2 LIVE creatives
  { id: "30000000-0000-4000-8000-000000000101", campaignId: IDS.campaigns.live, name: "HCP Banner 300x250 v3", state: "LIVE", pulsepointTagId: "PP-TAG-001" },
  { id: "30000000-0000-4000-8000-000000000102", campaignId: IDS.campaigns.live, name: "HCP Banner 728x90 v3", state: "LIVE", pulsepointTagId: "PP-TAG-002" },
  // SYNCED campaign — 1 TRAFFICKED
  { id: "30000000-0000-4000-8000-000000000201", campaignId: IDS.campaigns.synced, name: "Cardiology Native 1200x628 v2", state: "TRAFFICKED", pulsepointTagId: "PP-TAG-101" },
  // READY_TO_TRAFFIC — 3 LOCKED
  { id: "30000000-0000-4000-8000-000000000301", campaignId: IDS.campaigns.ready, name: "Oncology Banner 300x250 v1", state: "LOCKED" },
  { id: "30000000-0000-4000-8000-000000000302", campaignId: IDS.campaigns.ready, name: "Oncology Banner 970x250 v1", state: "LOCKED" },
  { id: "30000000-0000-4000-8000-000000000303", campaignId: IDS.campaigns.ready, name: "Oncology Native 1200x628 v1", state: "LOCKED" },
  // DRAFT — 1 DRAFT
  { id: "30000000-0000-4000-8000-000000000401", campaignId: IDS.campaigns.draft, name: "Diabetes Concept 300x250 draft", state: "DRAFT" },
  // FAILED SYNC — 1 LOCKED
  { id: "30000000-0000-4000-8000-000000000501", campaignId: IDS.campaigns.failedSync, name: "Pediatric Vaccine Banner 300x250 v1", state: "LOCKED" },
];

async function seedCreatives() {
  for (const cr of CREATIVES) {
    const lockedAt = ["LOCKED", "TRAFFICKED", "LIVE"].includes(cr.state)
      ? new Date("2026-03-26T18:30:00Z")
      : null;
    const mlrApprovedAt = lockedAt ?? (cr.state === "MLR_APPROVED" ? new Date("2026-03-26T17:00:00Z") : null);
    const data = {
      id: cr.id,
      campaignId: cr.campaignId,
      name: cr.name,
      state: cr.state,
      pulsepointTagId: cr.pulsepointTagId ?? null,
      lockedAt,
      mlrApprovedAt,
      mlrApprovedBy: mlrApprovedAt ? IDS.users.mlr : null,
    };
    await prisma.creative.upsert({
      where: { id: cr.id },
      create: data,
      update: data,
    });
  }
  return CREATIVES.length;
}

async function seedAudiences() {
  // Campaigns that should carry a validated audience.
  const audienceCampaigns = [
    { id: "40000000-0000-4000-8000-000000000001", campaignId: IDS.campaigns.live, rowCount: 8 },
    { id: "40000000-0000-4000-8000-000000000002", campaignId: IDS.campaigns.synced, rowCount: 8 },
    { id: "40000000-0000-4000-8000-000000000003", campaignId: IDS.campaigns.ready, rowCount: 12 },
    { id: "40000000-0000-4000-8000-000000000005", campaignId: IDS.campaigns.failedSync, rowCount: 8 },
  ];
  const validationReport = {
    valid: true,
    rows: DEMO_NPIS.map((npi, idx) => ({ row: idx + 1, npi, valid: true })),
    duplicateCount: 0,
    invalidCount: 0,
  };
  for (const a of audienceCampaigns) {
    const data = {
      id: a.id,
      campaignId: a.campaignId,
      version: 1,
      filename: "demo-hcp-audience.csv",
      rowCount: a.rowCount,
      valid: true,
      validationReport,
      suppressionVersion: "2026-Q2",
      validatedAt: new Date("2026-03-26T16:00:00Z"),
    };
    await prisma.audienceList.upsert({
      where: { id: a.id },
      create: data,
      update: data,
    });
  }
  return audienceCampaigns.length;
}

async function seedIdMappings() {
  // Only LIVE and SYNCED campaigns have mappings to PulsePoint.
  const mappings: Array<{
    id: string;
    campaignId: string;
    amsField: string;
    pulsepointField: string;
    owner: "AMS" | "PULSEPOINT" | "BOTH";
    amsValue: string;
    pulsepointValue: string;
  }> = [
    // LIVE — 3 mappings
    { id: "50000000-0000-4000-8000-000000000101", campaignId: IDS.campaigns.live, amsField: "name", pulsepointField: "campaign_name", owner: "AMS", amsValue: "Demo HCP Awareness Q2 2026", pulsepointValue: "Demo HCP Awareness Q2 2026" },
    { id: "50000000-0000-4000-8000-000000000102", campaignId: IDS.campaigns.live, amsField: "budget_usd", pulsepointField: "budget", owner: "AMS", amsValue: "250000.00", pulsepointValue: "250000.00" },
    { id: "50000000-0000-4000-8000-000000000103", campaignId: IDS.campaigns.live, amsField: "flight_dates", pulsepointField: "flight_dates", owner: "BOTH", amsValue: "2026-04-01..2026-06-30", pulsepointValue: "2026-04-01..2026-06-30" },
    { id: "50000000-0000-4000-8000-000000000104", campaignId: IDS.campaigns.live, amsField: "audience", pulsepointField: "segment_id", owner: "PULSEPOINT", amsValue: "demo-hcp-audience.csv", pulsepointValue: "PP-SEG-7788" },
    // SYNCED — 3 mappings
    { id: "50000000-0000-4000-8000-000000000201", campaignId: IDS.campaigns.synced, amsField: "name", pulsepointField: "campaign_name", owner: "AMS", amsValue: "Cardiology Education Series", pulsepointValue: "Cardiology Education Series" },
    { id: "50000000-0000-4000-8000-000000000202", campaignId: IDS.campaigns.synced, amsField: "budget_usd", pulsepointField: "budget", owner: "AMS", amsValue: "180000.00", pulsepointValue: "180000.00" },
    { id: "50000000-0000-4000-8000-000000000203", campaignId: IDS.campaigns.synced, amsField: "audience", pulsepointField: "segment_id", owner: "PULSEPOINT", amsValue: "demo-hcp-audience.csv", pulsepointValue: "PP-SEG-7790" },
  ];
  const lastSyncedAt = new Date("2026-04-01T09:00:00Z");
  for (const m of mappings) {
    await prisma.idMapping.upsert({
      where: { id: m.id },
      create: { ...m, lastSyncedAt },
      update: { ...m, lastSyncedAt },
    });
  }
  return mappings.length;
}

async function seedSyncJobs() {
  const jobs: Array<{
    id: string;
    campaignId: string;
    status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "DEAD";
    attempt: number;
    maxAttempts: number;
    errorCode?: string | null;
    errorDetail?: string | null;
    payload?: object | null;
    startedAt?: Date | null;
    finishedAt?: Date | null;
  }> = [
    {
      id: "60000000-0000-4000-8000-000000000101",
      campaignId: IDS.campaigns.live,
      status: "SUCCEEDED",
      attempt: 1,
      maxAttempts: 5,
      payload: { pulsepointId: "PP-DEMO-12345", action: "create_campaign" },
      startedAt: new Date("2026-04-01T08:55:00Z"),
      finishedAt: new Date("2026-04-01T08:55:08Z"),
    },
    {
      id: "60000000-0000-4000-8000-000000000201",
      campaignId: IDS.campaigns.synced,
      status: "SUCCEEDED",
      attempt: 1,
      maxAttempts: 5,
      payload: { pulsepointId: "PP-DEMO-23456", action: "create_campaign" },
      startedAt: new Date("2026-05-14T22:30:00Z"),
      finishedAt: new Date("2026-05-14T22:30:09Z"),
    },
    {
      id: "60000000-0000-4000-8000-000000000501",
      campaignId: IDS.campaigns.failedSync,
      status: "FAILED",
      attempt: 3,
      maxAttempts: 5,
      errorCode: "AMS_SYNC_001",
      errorDetail: "PulsePoint API timeout after 3 attempts",
      payload: { action: "create_campaign", lastAttemptAt: "2026-06-14T14:05:00Z" },
      startedAt: new Date("2026-06-14T14:00:00Z"),
      finishedAt: new Date("2026-06-14T14:05:30Z"),
    },
  ];
  for (const j of jobs) {
    await prisma.syncJob.upsert({
      where: { id: j.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: j as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: j as any,
    });
  }
  return jobs.length;
}

async function seedReporting() {
  // 4 ReportingSnapshots for the LIVE campaign: spend_usd from `pulsepoint_raw`
  // and `ams_normalized` at two timestamps.
  // T1 deltas ~1% (within tolerance), T2 deltas ~6% (out of tolerance).
  const snapshots = [
    { id: "70000000-0000-4000-8000-000000000101", source: "pulsepoint_raw", value: "82000.0000", asOf: new Date("2026-05-01T05:00:00Z") },
    { id: "70000000-0000-4000-8000-000000000102", source: "ams_normalized", value: "82820.0000", asOf: new Date("2026-05-01T05:00:00Z") },
    { id: "70000000-0000-4000-8000-000000000103", source: "pulsepoint_raw", value: "156000.0000", asOf: new Date("2026-06-01T05:00:00Z") },
    { id: "70000000-0000-4000-8000-000000000104", source: "ams_normalized", value: "165360.0000", asOf: new Date("2026-06-01T05:00:00Z") },
  ];
  for (const s of snapshots) {
    await prisma.reportingSnapshot.upsert({
      where: { id: s.id },
      create: { ...s, campaignId: IDS.campaigns.live, metricKey: "spend_usd" },
      update: { ...s, campaignId: IDS.campaigns.live, metricKey: "spend_usd" },
    });
  }
  return snapshots.length;
}

async function seedReconciliation() {
  // T1: within tolerance (1% delta on 82,000)
  const within = {
    id: "80000000-0000-4000-8000-000000000101",
    campaignId: IDS.campaigns.live,
    metricKey: "spend_usd",
    amsValue: "82820.0000",
    pulsepointValue: "82000.0000",
    delta: "820.0000",
    deltaExplain: "AMS spend includes platform fees per finance definition (1.0% delta within tolerance).",
    withinTolerance: true,
    createdAt: new Date("2026-05-01T06:00:00Z"),
  };
  // T2: OUT of tolerance (~6% delta)
  const out = {
    id: "80000000-0000-4000-8000-000000000102",
    campaignId: IDS.campaigns.live,
    metricKey: "spend_usd",
    amsValue: "165360.0000",
    pulsepointValue: "156000.0000",
    delta: "9360.0000",
    deltaExplain: "AMS spend exceeds PulsePoint raw by 6.0% — investigate fee bookkeeping and timezone cutoff.",
    withinTolerance: false,
    createdAt: new Date("2026-06-01T06:00:00Z"),
  };
  for (const r of [within, out]) {
    await prisma.reconciliationRun.upsert({
      where: { id: r.id },
      create: r,
      update: r,
    });
  }
  return 2;
}

async function seedPacingAlerts() {
  // Cardiology (SYNCED) is underpacing: at 30% spend with 50% flight elapsed.
  const alert = {
    id: "90000000-0000-4000-8000-000000000201",
    campaignId: IDS.campaigns.synced,
    pacingPct: "30.00",
    daysLeft: 47,
    message: "Underpacing: 30% spend with 50% flight elapsed. Investigate delivery throttling.",
    acknowledged: false,
    createdAt: new Date("2026-07-01T13:00:00Z"),
  };
  await prisma.pacingAlert.upsert({
    where: { id: alert.id },
    create: alert,
    update: alert,
  });
  return 1;
}

async function seedAuditLog() {
  // Idempotency: replace seeded rows on every run by deleting any audit log
  // whose `after` payload carries our seed tag, then recreating them.
  await prisma.auditLog.deleteMany({
    where: { after: { path: ["_seed"], equals: SEED_TAG } },
  });

  const entries: Array<{
    entityType: string;
    entityId: string;
    action: string;
    actorId: string | null;
    before: object | null;
    after: object;
    createdAt: Date;
  }> = [
    // LIVE campaign lifecycle
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "create", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, name: CAMPAIGNS[0].name, state: "DRAFT" }, createdAt: new Date("2026-03-20T14:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "audience-validate", actorId: IDS.users.traffic, before: { valid: false }, after: { _seed: SEED_TAG, valid: true, rowCount: 8 }, createdAt: new Date("2026-03-24T11:00:00Z") },
    { entityType: "creative", entityId: "30000000-0000-4000-8000-000000000101", action: "creative-transition", actorId: IDS.users.mlr, before: { state: "SUBMITTED" }, after: { _seed: SEED_TAG, state: "MLR_APPROVED" }, createdAt: new Date("2026-03-25T15:30:00Z") },
    { entityType: "creative", entityId: "30000000-0000-4000-8000-000000000102", action: "creative-transition", actorId: IDS.users.mlr, before: { state: "SUBMITTED" }, after: { _seed: SEED_TAG, state: "MLR_APPROVED" }, createdAt: new Date("2026-03-25T15:32:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "qa-pass", actorId: IDS.users.ops, before: { audienceQa: false }, after: { _seed: SEED_TAG, audienceQa: true, budgetQa: true, creativeQa: true }, createdAt: new Date("2026-03-25T16:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "transition", actorId: IDS.users.ops, before: { state: "APPROVED" }, after: { _seed: SEED_TAG, state: "READY_TO_TRAFFIC" }, createdAt: new Date("2026-03-25T16:15:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "sync-enqueue", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, syncJobId: "60000000-0000-4000-8000-000000000101" }, createdAt: new Date("2026-04-01T08:54:30Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "sync-success", actorId: null, before: { state: "READY_TO_TRAFFIC" }, after: { _seed: SEED_TAG, state: "SYNCED", pulsepointId: "PP-DEMO-12345" }, createdAt: new Date("2026-04-01T08:55:10Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "transition", actorId: IDS.users.ops, before: { state: "SYNCED" }, after: { _seed: SEED_TAG, state: "LIVE" }, createdAt: new Date("2026-04-01T13:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "reconcile", actorId: IDS.users.ops, before: null, after: { _seed: SEED_TAG, metricKey: "spend_usd", withinTolerance: true, delta: 820 }, createdAt: new Date("2026-05-01T06:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "reconcile", actorId: IDS.users.ops, before: null, after: { _seed: SEED_TAG, metricKey: "spend_usd", withinTolerance: false, delta: 9360 }, createdAt: new Date("2026-06-01T06:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.live, action: "pacing-evaluate", actorId: null, before: null, after: { _seed: SEED_TAG, pacingPct: 65, alertTriggered: false }, createdAt: new Date("2026-06-15T13:00:00Z") },

    // SYNCED — Cardiology
    { entityType: "campaign", entityId: IDS.campaigns.synced, action: "create", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, name: CAMPAIGNS[1].name, state: "DRAFT" }, createdAt: new Date("2026-05-01T10:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.synced, action: "qa-pass", actorId: IDS.users.ops, before: { audienceQa: false }, after: { _seed: SEED_TAG, audienceQa: true, budgetQa: true, creativeQa: true }, createdAt: new Date("2026-05-10T15:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.synced, action: "sync-enqueue", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, syncJobId: "60000000-0000-4000-8000-000000000201" }, createdAt: new Date("2026-05-14T22:29:30Z") },
    { entityType: "campaign", entityId: IDS.campaigns.synced, action: "sync-success", actorId: null, before: { state: "READY_TO_TRAFFIC" }, after: { _seed: SEED_TAG, state: "SYNCED", pulsepointId: "PP-DEMO-23456" }, createdAt: new Date("2026-05-14T22:30:10Z") },
    { entityType: "campaign", entityId: IDS.campaigns.synced, action: "pacing-evaluate", actorId: null, before: null, after: { _seed: SEED_TAG, pacingPct: 30, alertTriggered: true, alertId: "90000000-0000-4000-8000-000000000201" }, createdAt: new Date("2026-07-01T13:00:00Z") },

    // READY_TO_TRAFFIC — Oncology
    { entityType: "campaign", entityId: IDS.campaigns.ready, action: "create", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, name: CAMPAIGNS[2].name, state: "DRAFT" }, createdAt: new Date("2026-04-15T09:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.ready, action: "audience-validate", actorId: IDS.users.traffic, before: { valid: false }, after: { _seed: SEED_TAG, valid: true, rowCount: 12 }, createdAt: new Date("2026-05-02T11:00:00Z") },
    { entityType: "creative", entityId: "30000000-0000-4000-8000-000000000301", action: "creative-transition", actorId: IDS.users.ops, before: { state: "MLR_APPROVED" }, after: { _seed: SEED_TAG, state: "LOCKED" }, createdAt: new Date("2026-05-20T16:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.ready, action: "qa-pass", actorId: IDS.users.ops, before: { audienceQa: false }, after: { _seed: SEED_TAG, audienceQa: true, budgetQa: true, creativeQa: true }, createdAt: new Date("2026-05-21T12:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.ready, action: "transition", actorId: IDS.users.ops, before: { state: "APPROVED" }, after: { _seed: SEED_TAG, state: "READY_TO_TRAFFIC" }, createdAt: new Date("2026-05-21T12:30:00Z") },

    // DRAFT — Diabetes
    { entityType: "campaign", entityId: IDS.campaigns.draft, action: "create", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, name: CAMPAIGNS[3].name, state: "DRAFT" }, createdAt: new Date("2026-05-25T10:00:00Z") },

    // FAILED SYNC — Pediatric Vaccine
    { entityType: "campaign", entityId: IDS.campaigns.failedSync, action: "create", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, name: CAMPAIGNS[4].name, state: "DRAFT" }, createdAt: new Date("2026-05-30T09:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.failedSync, action: "qa-pass", actorId: IDS.users.ops, before: { audienceQa: false }, after: { _seed: SEED_TAG, audienceQa: true, budgetQa: true, creativeQa: true }, createdAt: new Date("2026-06-13T14:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.failedSync, action: "transition", actorId: IDS.users.ops, before: { state: "APPROVED" }, after: { _seed: SEED_TAG, state: "READY_TO_TRAFFIC" }, createdAt: new Date("2026-06-13T15:00:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.failedSync, action: "sync-enqueue", actorId: IDS.users.traffic, before: null, after: { _seed: SEED_TAG, syncJobId: "60000000-0000-4000-8000-000000000501" }, createdAt: new Date("2026-06-14T13:59:00Z") },
    { entityType: "campaign", entityId: IDS.campaigns.failedSync, action: "sync-fail", actorId: null, before: { attempt: 2 }, after: { _seed: SEED_TAG, attempt: 3, errorCode: "AMS_SYNC_001", errorDetail: "PulsePoint API timeout after 3 attempts" }, createdAt: new Date("2026-06-14T14:05:30Z") },
  ];

  for (const e of entries) {
    await prisma.auditLog.create({ data: e });
  }
  return entries.length;
}

async function main() {
  const counts = {
    errorRunbooks: await seedRunbooks(),
    metricDefinitions: await seedMetrics(),
    users: await seedUsers(),
    campaigns: await seedCampaigns(),
    creatives: await seedCreatives(),
    audienceLists: await seedAudiences(),
    idMappings: await seedIdMappings(),
    syncJobs: await seedSyncJobs(),
    reportingSnapshots: await seedReporting(),
    reconciliationRuns: await seedReconciliation(),
    pacingAlerts: await seedPacingAlerts(),
    auditLog: await seedAuditLog(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
