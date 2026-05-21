/**
 * Org-scoped database client — PulseCore security cornerstone
 *
 * WHO: Server actions, route handlers, webhooks (after org is known)
 * WHAT: Wraps Prisma with automatic orgId injection on tenant tables
 * HOW: Use getOrgDb(orgId) — never query Member/Event/etc. via raw prisma in app code
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isOrgScopedModel } from "@/lib/org-models";

const READ_OPS = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

const WRITE_FILTER_OPS = new Set([
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
]);

function mergeWhere<T extends { where?: unknown }>(
  args: T,
  orgId: string,
): T {
  const existing = (args.where ?? {}) as Record<string, unknown>;
  return {
    ...args,
    where: { ...existing, orgId },
  };
}

function mergeCreateData<T extends { data?: unknown }>(
  args: T,
  orgId: string,
): T {
  const data = args.data;
  if (!data || typeof data !== "object") {
    return args;
  }
  if (Array.isArray(data)) {
    return {
      ...args,
      data: data.map((row) =>
        typeof row === "object" && row !== null
          ? { ...row, orgId }
          : row,
      ),
    };
  }
  return {
    ...args,
    data: { ...(data as Record<string, unknown>), orgId },
  };
}

/**
 * Returns a Prisma client extension scoped to one organization.
 */
export function getOrgDb(orgId: string) {
  if (!orgId || typeof orgId !== "string") {
    throw new Error("getOrgDb: orgId is required");
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!isOrgScopedModel(model)) {
            return query(args);
          }

          let nextArgs = args as Record<string, unknown>;

          if (READ_OPS.has(operation) || WRITE_FILTER_OPS.has(operation)) {
            nextArgs = mergeWhere(nextArgs, orgId);
          }

          if (operation === "create" || operation === "createMany") {
            nextArgs = mergeCreateData(nextArgs, orgId);
          }

          if (operation === "upsert") {
            nextArgs = mergeCreateData(
              mergeWhere(nextArgs, orgId),
              orgId,
            );
          }

          return query(nextArgs);
        },
      },
    },
  });
}

export type OrgDb = ReturnType<typeof getOrgDb>;

/** Global prisma for Organization/User sync (webhooks, admin). */
export { prisma };
