/**
 * PulsePoint execution-layer client.
 *
 * WHO THIS IS FOR: services/sync-queue.ts (push campaigns), reconciliation.ts
 *   (pull metrics).
 * WHAT IT DOES: Thin HTTP wrapper around the PulsePoint REST API with:
 *   - SSRF allowlist (only PULSEPOINT_API_BASE_URL origin; no RFC1918 in prod)
 *   - 10s timeout via AbortSignal.timeout
 *   - Idempotency-Key header on POST (UUID + amsUuid scope)
 *   - zod response validation
 *   - Generic AmsError mapping → runbook AMS_SYNC_001
 * HOW IT CONNECTS: Stub fallback when PULSEPOINT_API_BASE_URL or
 *   PULSEPOINT_API_KEY missing — preserves dev flow.
 *
 * SECURITY: SECURE-FORCE.md "Fetch unvalidated URLs" — every call goes
 *   through isAllowedEndpoint() before fetch(). No template literals build
 *   URLs from user input; only the static base + encodeURIComponent on ids.
 *
 * TODO(IT): Replace ASSUMED REST shape with real PulsePoint API contract
 *   once IT provides it. Schemas live at the bottom of this file.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { isAllowedEndpoint } from "@ams/shared";
import { AmsError } from "../lib/errors.js";
import { getEnv } from "../lib/env.js";

const FETCH_TIMEOUT_MS = 10_000;

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

/**
 * Decide whether to use stub mode (no live API config).
 *
 * @returns true if both PULSEPOINT_API_BASE_URL and PULSEPOINT_API_KEY
 *   are set; false → stub deterministic fake IDs for dev/test.
 */
function liveModeAvailable(): {
  live: false;
} | {
  live: true;
  base: string;
  key: string;
} {
  const env = getEnv();
  if (!env.pulsepointApiBaseUrl || !env.pulsepointApiKey) return { live: false };
  return {
    live: true,
    base: env.pulsepointApiBaseUrl,
    key: env.pulsepointApiKey,
  };
}

/**
 * Guard: only allow fetches whose origin matches the configured base URL.
 *
 * WHO THIS IS FOR: every fetch() in this file.
 * WHAT IT DOES: parses both URLs; checks scheme + origin match; in prod
 *   also blocks RFC1918 / localhost via shared isAllowedEndpoint.
 *
 * @param url destination URL
 * @param base configured PulsePoint base (already validated as URL)
 * @returns true if safe to fetch
 */
function _isAllowedEndpoint(url: string, base: string): boolean {
  const env = getEnv();
  return isAllowedEndpoint(url, {
    allowedOrigins: [base],
    enforceProductionRules: env.isProduction,
  });
}

const syncResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    campaignId: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

const metricResponseSchema = z
  .object({
    value: z.number().optional(),
  })
  .passthrough();

function buildSyncError(detail: string): AmsError {
  return new AmsError("AMS_SYNC_001", "PulsePoint sync failed", 502, { detail });
}

/**
 * Push a campaign to PulsePoint.
 *
 * WHO THIS IS FOR: services/sync-queue.ts.
 * WHAT IT DOES: In live mode, POSTs the payload with an idempotency key,
 *   validates the response with zod, and returns the PulsePoint id. In
 *   stub mode, returns a deterministic fake id for downstream testing.
 *
 * @param payload campaign sync payload (NO PHI)
 * @returns { pulsepointId, raw }
 * @throws AmsError("AMS_SYNC_001", ...) for any HTTP / validation failure
 */
export async function pushCampaignToPulsePoint(
  payload: PulsePointCampaignPayload,
): Promise<PulsePointSyncResult> {
  const mode = liveModeAvailable();
  if (!mode.live) {
    return {
      pulsepointId: `PP-STUB-${payload.amsUuid.slice(0, 8)}`,
      raw: {
        mode: "stub",
        message:
          "Set PULSEPOINT_API_BASE_URL and PULSEPOINT_API_KEY for live sync",
      },
    };
  }

  const url = `${mode.base.replace(/\/$/, "")}/campaigns`;
  if (!_isAllowedEndpoint(url, mode.base)) {
    throw buildSyncError("PulsePoint endpoint failed allowlist check");
  }

  const idempotencyKey = `${payload.amsUuid}:${randomUUID()}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mode.key}`,
        "Idempotency-Key": idempotencyKey,
        "User-Agent": "ams-api/1.0",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const reason = e instanceof Error ? e.name : "network";
    throw buildSyncError(`Network error: ${reason}`);
  }

  if (!res.ok) {
    throw buildSyncError(`HTTP ${res.status}`);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw buildSyncError("Response was not JSON");
  }

  const parsed = syncResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw buildSyncError("Response shape unexpected");
  }
  const id = parsed.data.id ?? parsed.data.campaignId;
  if (id === undefined || id === null) {
    throw buildSyncError("Response missing campaign id");
  }
  return {
    pulsepointId: String(id),
    raw: parsed.data as Record<string, unknown>,
  };
}

/**
 * Pull a single normalized metric value from PulsePoint.
 *
 * WHO THIS IS FOR: services/reconciliation.ts.
 * WHAT IT DOES: GETs /campaigns/:id/metrics/:metricKey, validates with zod.
 *   Stub mode returns deterministic demo values for known metrics.
 *
 * @param pulsepointId external PulsePoint campaign id
 * @param metricKey one of the registered metric keys (validated upstream)
 * @returns numeric value or null if unavailable
 */
export async function pullPulsePointMetrics(
  pulsepointId: string,
  metricKey: string,
): Promise<number | null> {
  const mode = liveModeAvailable();
  if (!mode.live) {
    if (metricKey === "spend_usd") return 1000;
    if (metricKey === "impressions") return 50000;
    return null;
  }

  const url = `${mode.base.replace(/\/$/, "")}/campaigns/${encodeURIComponent(
    pulsepointId,
  )}/metrics/${encodeURIComponent(metricKey)}`;

  if (!_isAllowedEndpoint(url, mode.base)) {
    return null;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${mode.key}`,
        "User-Agent": "ams-api/1.0",
      },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return null;
  }
  const parsed = metricResponseSchema.safeParse(json);
  if (!parsed.success) return null;
  return typeof parsed.data.value === "number" ? parsed.data.value : null;
}
