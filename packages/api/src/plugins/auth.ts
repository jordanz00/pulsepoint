/**
 * Authentication plugin — Entra ID JWT in prod, header fallback in dev.
 *
 * WHO THIS IS FOR: server.ts (registers globally); every route below it.
 * WHAT IT DOES: Validates the Authorization Bearer token against Entra ID
 *   JWKS using `jose`; looks up the matching User row by email. In dev mode
 *   (NODE_ENV !== "production" AND AMS_DEV_AUTH_ALLOW_HEADER=true) it
 *   accepts X-AMS-User-Email and either finds OR creates a User. In prod
 *   the user MUST already exist (no auto-provisioning).
 * HOW IT CONNECTS: Decorates req.actor; routes import assertPermission()
 *   from lib/auth-context.ts to enforce RBAC on top.
 *
 * SECURITY: Per SECURE-FORCE.md — no hardcoded secrets, validate every
 *   protected route, fail safely with generic 401/403 (no claim contents
 *   leaked back). JWT validation uses jose's createRemoteJWKSet for key
 *   rotation; cache + retry built-in. Allowlists the Entra issuer to
 *   prevent token confusion attacks.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { prisma } from "../lib/prisma.js";
import { roleFromDb, type RequestActor } from "../lib/auth-context.js";
import { Errors } from "../lib/errors.js";
import { getEnv } from "../lib/env.js";

declare module "fastify" {
  interface FastifyRequest {
    actor: RequestActor;
  }
}

/** Routes that skip auth entirely (health, docs, openapi spec). */
function isPublicRoute(url: string): boolean {
  if (url.startsWith("/health")) return true;
  if (url.startsWith("/openapi")) return true;
  if (url.startsWith("/docs")) return true;
  return false;
}

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

/**
 * Lazily build the JWKS resolver for the configured Entra tenant.
 *
 * @param tenantId Azure tenant GUID
 * @returns JWKS getter usable by jose.jwtVerify
 */
function getJwks(tenantId: string) {
  if (!jwksCache) {
    const url = new URL(
      `https://login.microsoftonline.com/${encodeURIComponent(
        tenantId,
      )}/discovery/v2.0/keys`,
    );
    jwksCache = createRemoteJWKSet(url, {
      cacheMaxAge: 10 * 60 * 1000,
      cooldownDuration: 30 * 1000,
    });
  }
  return jwksCache;
}

/**
 * Extract claims we trust from a verified Entra ID token.
 *
 * Entra issues `preferred_username`, `upn`, `email` — pick the most
 * reliable one. `oid` is the stable user object id (do NOT use `sub`,
 * which differs between apps).
 */
function pickEmail(payload: JWTPayload): string | undefined {
  const claims = payload as JWTPayload & {
    email?: unknown;
    preferred_username?: unknown;
    upn?: unknown;
  };
  for (const key of ["email", "preferred_username", "upn"] as const) {
    const v = claims[key];
    if (typeof v === "string" && v.includes("@")) return v.toLowerCase();
  }
  return undefined;
}

async function verifyEntraToken(
  authHeader: string,
  tenantId: string,
  audience: string,
): Promise<{ email: string; oid: string }> {
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!m) throw Errors.unauthorized("Missing Bearer token");
  const token = m[1];

  const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  const { payload } = await jwtVerify(token, getJwks(tenantId), {
    issuer,
    audience,
  });

  const email = pickEmail(payload);
  const oid = typeof payload.oid === "string" ? payload.oid : undefined;
  if (!email || !oid) {
    throw Errors.unauthorized("Token missing required claims");
  }
  return { email, oid };
}

/**
 * preHandler hook: resolve req.actor.
 *
 * Order:
 *   1. Public route → no actor needed; return.
 *   2. authMode === "entra" → require valid Bearer JWT.
 *   3. authMode === "dev" + AMS_DEV_AUTH_ALLOW_HEADER + non-prod →
 *      accept X-AMS-User-Email, find-or-create User.
 *   4. else → 401.
 */
async function resolveActor(
  req: FastifyRequest,
): Promise<RequestActor | null> {
  if (isPublicRoute(req.url)) return null;

  const env = getEnv();

  if (env.authMode === "entra") {
    const header = req.headers.authorization;
    if (!header) throw Errors.unauthorized("Missing Authorization header");
    if (!env.azureTenantId || !env.azureApiAudience) {
      // Defense in depth — env validation should have caught this.
      throw Errors.unauthorized("Auth misconfigured");
    }
    const { email, oid } = await verifyEntraToken(
      header,
      env.azureTenantId,
      env.azureApiAudience,
    );

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // No auto-provisioning in prod — security posture.
      throw Errors.forbidden("User not provisioned in AMS");
    }
    return {
      id: user.id,
      email: user.email,
      role: roleFromDb(user.role),
      authMode: "entra",
      oid,
    };
  }

  // Dev mode
  if (env.isProduction) {
    throw Errors.unauthorized("Dev auth disabled in production");
  }
  if (!env.devAuthAllowHeader) {
    throw Errors.unauthorized(
      "Dev header auth disabled (set AMS_DEV_AUTH_ALLOW_HEADER=true)",
    );
  }
  const rawHeader = req.headers["x-ams-user-email"];
  const email =
    (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader) || "ops@example.com";

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: email.split("@")[0], role: "OPS_LEAD" },
    });
  }
  return {
    id: user.id,
    email: user.email,
    role: roleFromDb(user.role),
    authMode: "dev",
  };
}

/**
 * Fastify auth plugin — register globally.
 *
 * WHO THIS IS FOR: server.ts.
 * WHAT IT DOES: Adds a preHandler hook that populates req.actor or rejects
 *   with 401/403. Decorates req.actor as a typed property.
 */
async function authPluginImpl(app: FastifyInstance) {
  app.decorateRequest("actor", null);

  app.addHook("preHandler", async (req) => {
    const actor = await resolveActor(req);
    if (actor) {
      req.actor = actor;
    }
  });
}

export const authPlugin = fp(authPluginImpl, {
  name: "ams-auth",
});
