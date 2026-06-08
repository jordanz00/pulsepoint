/**
 * Client for the integrated ad-ops Fastify API (@ams/api on port 4000).
 * Used by /[orgSlug]/advertising/* admin routes.
 */

const API = process.env.NEXT_PUBLIC_AD_OPS_API_URL ?? "http://localhost:4000";

export type AdOpsUserEmail =
  | "ops@example.com"
  | "traffic@example.com"
  | "mlr@example.com"
  | "viewer@example.com";

let currentUser: AdOpsUserEmail = "ops@example.com";

export function setAdOpsApiUser(email: AdOpsUserEmail) {
  currentUser = email;
}

export function getAdOpsApiUser() {
  return currentUser;
}

export async function adOpsApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-AMS-User-Email": currentUser,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message ?? "Ad-ops API error"), {
      code: data.code,
      data,
    });
  }
  return data as T;
}
