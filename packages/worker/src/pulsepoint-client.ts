/**
 * Worker-local PulsePoint execution-layer client.
 *
 * WHO THIS IS FOR: `process-sync-job.ts`. Worker keeps its own copy
 *   (instead of importing from `@ams/api`) so the worker container can
 *   ship without the API's dependency tree.
 * WHAT IT DOES: pushes a campaign payload to the PulsePoint API. In
 *   stub mode (no env vars set) returns a deterministic fake ID so the
 *   reconciliation pipeline can exercise end-to-end without calling
 *   external services.
 * HOW IT CONNECTS: invoked from `processSyncJob`. The shape matches
 *   the API package's `pushCampaignToPulsePoint` for behavioural
 *   parity until IT publishes the real contract.
 *
 * SECURITY:
 *   - HTTPS-only host validation enforced before egress.
 *   - Bearer token read from `PULSEPOINT_API_KEY`, never logged.
 *   - Idempotency-Key header (UUID derived from SyncJob.id) prevents
 *     duplicate campaign creation if BullMQ retries an in-flight job
 *     after a transient network failure.
 *
 * TODO(IT): replace stub with the documented PulsePoint contract,
 *   including auth scheme and error taxonomy. Re-validate
 *   `_isAllowedEndpoint` host allowlist when the prod URL is provided.
 */

export interface PulsePointCampaignPayload {
  amsUuid: string;
  name: string;
  budgetUsd: number;
  flightStart: string;
  flightEnd: string;
  creativeTags: string[];
}

export interface PulsePointSyncResult {
  pulsepointId: string;
  raw?: Record<string, unknown>;
}

export interface PulsePointPushOptions {
  /** Idempotency key — typically `SyncJob.id`. Sent as `Idempotency-Key`. */
  idempotencyKey: string;
}

/**
 * Allowlist host check. Mirrors the API's `_isAllowedEndpoint` policy.
 * In production we require HTTPS; in development http://localhost is OK.
 */
function isAllowedEndpoint(rawUrl: string): boolean {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return false;
  }
  if (process.env.NODE_ENV === "production") {
    return u.protocol === "https:";
  }
  if (u.protocol === "https:") return true;
  if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) {
    return true;
  }
  return false;
}

export async function pushCampaignToPulsePoint(
  payload: PulsePointCampaignPayload,
  options: PulsePointPushOptions
): Promise<PulsePointSyncResult> {
  const base = process.env.PULSEPOINT_API_BASE_URL;
  const key = process.env.PULSEPOINT_API_KEY;

  if (!base || !key) {
    return {
      pulsepointId: `PP-STUB-${payload.amsUuid.slice(0, 8)}`,
      raw: {
        mode: "stub",
        message: "Set PULSEPOINT_API_BASE_URL and PULSEPOINT_API_KEY for live sync",
      },
    };
  }

  const endpoint = `${base.replace(/\/+$/, "")}/campaigns`;
  if (!isAllowedEndpoint(endpoint)) {
    const err = new Error("PulsePoint endpoint blocked by allowlist policy");
    (err as Error & { code: string }).code = "AMS_SEC_001";
    throw err;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Idempotency-Key": options.idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = new Error(`PulsePoint API ${res.status}`);
    (err as Error & { code: string }).code = "AMS_SYNC_001";
    throw err;
  }

  const data = (await res.json()) as { id?: string; campaignId?: string };
  const pulsepointId = data.id ?? data.campaignId;
  if (!pulsepointId) {
    const err = new Error("PulsePoint response missing campaign id");
    (err as Error & { code: string }).code = "AMS_SYNC_001";
    throw err;
  }

  return { pulsepointId: String(pulsepointId), raw: data as Record<string, unknown> };
}
