/**
 * @deprecated Import from `@/lib/adapters/microsoft365` — backward-compat re-exports.
 */

export {
  getMicrosoft365Config as getGraphConfig,
  isMicrosoft365Configured,
  microsoft365Adapter,
  type GraphMailThread,
} from "@/lib/adapters/microsoft365";

import { microsoft365Adapter } from "@/lib/adapters/microsoft365";
import { getMicrosoft365Config } from "@/lib/adapters/microsoft365/config";
import { fetchMailThreads } from "@/lib/adapters/microsoft365/capabilities/mail";

export function graphAuthorizeUrl(
  tenantId: string,
  state: string,
  redirectUri: string,
  clientId: string,
): string {
  return microsoft365Adapter.getAuthorizeUrl(state);
}

export async function exchangeGraphCode(code: string, redirectUri: string) {
  return microsoft365Adapter.exchangeCode(code);
}

export async function refreshGraphAccessToken(refreshToken: string) {
  return microsoft365Adapter.refreshToken(refreshToken);
}

export async function fetchRecentMailThreads(accessToken: string, limit = 15) {
  return fetchMailThreads(accessToken, limit);
}
