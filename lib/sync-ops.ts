/**
 * Sync & reconciliation ops — exceptions, imports, ad-ops jobs (real data only).
 */

import { getOrgDb } from "@/lib/db";
import { adOpsApi } from "@/lib/ad-ops-api";

export type SyncJobRow = {
  id: string;
  source: string;
  label: string;
  status: string;
  errorCode: string | null;
  errorDetail: string | null;
  createdAt: Date;
  href: string;
};

export type SyncOpsSnapshot = {
  dataAsOf: Date;
  openExceptions: number;
  failedExceptions: number;
  pendingImportBatches: number;
  importRowsPending: number;
  adOpsFailedJobs: number;
  adOpsTotalJobs: number;
  recentFailures: SyncJobRow[];
};

export type SyncOpsCard = {
  id: string;
  question: string;
  answer: string;
  href?: string;
  tone?: "neutral" | "attention" | "clear";
};

export async function loadSyncOpsSnapshot(orgId: string, orgSlug: string): Promise<SyncOpsSnapshot> {
  const db = getOrgDb(orgId);
  const base = `/${orgSlug}`;

  const [openExceptions, failedExceptions, pendingImportBatches, importRowsPending, exceptions, importBatches, adOps] =
    await Promise.all([
      db.automationException.count({ where: { orgId, resolvedAt: null } }),
      db.automationException.count({
        where: { orgId, resolvedAt: null, outcome: "FAILED" },
      }),
      db.memberImportBatch.count({ where: { orgId, status: "PENDING_REVIEW" } }),
      db.memberImportRow.count({
        where: { batch: { orgId, status: "PENDING_REVIEW" } },
      }),
      db.automationException.findMany({
        where: { orgId, resolvedAt: null },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          workflow: true,
          step: true,
          outcome: true,
          message: true,
          createdAt: true,
        },
      }),
      db.memberImportBatch.findMany({
        where: { orgId, status: "PENDING_REVIEW" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, fileName: true, rowCount: true, createdAt: true },
      }),
      loadAdOpsSyncSnapshot(orgSlug),
    ]);

  const recentFailures: SyncJobRow[] = [];

  for (const ex of exceptions) {
    recentFailures.push({
      id: ex.id,
      source: "automation",
      label: `${ex.workflow} · ${ex.step}`,
      status: ex.outcome,
      errorCode: null,
      errorDetail: ex.message,
      createdAt: ex.createdAt,
      href: `${base}/exceptions`,
    });
  }

  for (const batch of importBatches) {
    recentFailures.push({
      id: batch.id,
      source: "import",
      label: batch.fileName,
      status: "PENDING_REVIEW",
      errorCode: null,
      errorDetail: `${batch.rowCount} rows awaiting staff approval`,
      createdAt: batch.createdAt,
      href: `${base}/members/imports`,
    });
  }

  if (adOps) {
    for (const job of adOps.failedJobs) {
      recentFailures.push(job);
    }
  }

  recentFailures.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    dataAsOf: new Date(),
    openExceptions,
    failedExceptions,
    pendingImportBatches,
    importRowsPending,
    adOpsFailedJobs: adOps?.failedCount ?? 0,
    adOpsTotalJobs: adOps?.totalCount ?? 0,
    recentFailures: recentFailures.slice(0, 10),
  };
}

async function loadAdOpsSyncSnapshot(orgSlug: string): Promise<{
  failedCount: number;
  totalCount: number;
  failedJobs: SyncJobRow[];
} | null> {
  try {
    const jobs = await adOpsApi<
      Array<{
        id: string;
        status: string;
        errorCode: string | null;
        errorDetail: string | null;
        createdAt: string;
        campaign: { id: string; name: string };
      }>
    >("/sync/jobs");

    const failed = jobs.filter((j) => j.status === "FAILED" || j.status === "DEAD");
    const base = `/${orgSlug}/advertising`;

    return {
      failedCount: failed.length,
      totalCount: jobs.length,
      failedJobs: failed.map((j) => ({
        id: j.id,
        source: "ad-ops",
        label: j.campaign.name,
        status: j.status,
        errorCode: j.errorCode,
        errorDetail: j.errorDetail,
        createdAt: new Date(j.createdAt),
        href: `${base}/campaigns/${j.campaign.id}`,
      })),
    };
  } catch {
    return null;
  }
}

export function buildSyncOpsCards(snapshot: SyncOpsSnapshot, orgSlug: string): SyncOpsCard[] {
  const base = `/${orgSlug}`;
  const totalIssues =
    snapshot.openExceptions + snapshot.pendingImportBatches + snapshot.adOpsFailedJobs;

  const attention: string[] = [];
  if (snapshot.failedExceptions > 0) {
    attention.push(`${snapshot.failedExceptions} failed automation step${snapshot.failedExceptions === 1 ? "" : "s"}`);
  }
  if (snapshot.pendingImportBatches > 0) {
    attention.push(`${snapshot.pendingImportBatches} import batch${snapshot.pendingImportBatches === 1 ? "" : "es"}`);
  }
  if (snapshot.adOpsFailedJobs > 0) {
    attention.push(`${snapshot.adOpsFailedJobs} ad-ops sync job${snapshot.adOpsFailedJobs === 1 ? "" : "s"}`);
  }

  return [
    {
      id: "happening",
      question: "What is happening?",
      answer: `${snapshot.adOpsTotalJobs} ad-ops sync jobs tracked · ${snapshot.importRowsPending} import rows staged · ${snapshot.openExceptions} open exceptions`,
      tone: "neutral",
    },
    {
      id: "attention",
      question: "What needs attention?",
      answer:
        attention.length > 0 ? attention.join(" · ") : "All sync queues healthy — no failed jobs or blocked imports",
      href: totalIssues > 0 ? `${base}/sync` : `${base}/exceptions`,
      tone: attention.length > 0 ? "attention" : "clear",
    },
    {
      id: "blocked",
      question: "What is blocked?",
      answer:
        snapshot.pendingImportBatches > 0
          ? `Member roster updates blocked until ${snapshot.pendingImportBatches} import${snapshot.pendingImportBatches === 1 ? "" : "s"} approved`
          : snapshot.adOpsFailedJobs > 0
            ? "DSP trafficking blocked until failed sync jobs resolved"
            : "No reconciliation blocks",
      tone: snapshot.pendingImportBatches > 0 || snapshot.adOpsFailedJobs > 0 ? "attention" : "clear",
    },
    {
      id: "changed",
      question: "What changed?",
      answer: `${snapshot.recentFailures.length} recent failure or pending items in the last queue sweep`,
      tone: "neutral",
    },
    {
      id: "next",
      question: "What should happen next?",
      answer:
        snapshot.failedExceptions > 0
          ? "Resolve automation exceptions · check runbooks for email workflow failures"
          : snapshot.adOpsFailedJobs > 0
            ? "Open ad-ops sync queue · retry after fixing audience or mapping errors"
            : snapshot.pendingImportBatches > 0
              ? "Approve or reject staged member imports"
              : "Run leadership loop · confirm nightly jobs completed",
      href: snapshot.adOpsFailedJobs > 0
        ? `${base}/advertising/sync`
        : snapshot.pendingImportBatches > 0
          ? `${base}/members/imports`
          : `${base}/exceptions`,
      tone: "neutral",
    },
  ];
}

export function syncHealthStatus(snapshot: SyncOpsSnapshot): "healthy" | "degraded" | "critical" {
  if (snapshot.failedExceptions > 0 || snapshot.adOpsFailedJobs > 0) return "critical";
  if (snapshot.openExceptions > 0 || snapshot.pendingImportBatches > 0) return "degraded";
  return "healthy";
}
