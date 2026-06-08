/**
 * Typed Microsoft Graph GET helper with error isolation.
 */

export async function graphGet<T>(accessToken: string, path: string): Promise<T> {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`graph_fetch_failed:${path}:${res.status}`);
  }
  return res.json() as Promise<T>;
}
