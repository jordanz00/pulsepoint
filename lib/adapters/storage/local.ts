/**
 * Local filesystem storage adapter — works on every host, used as fallback.
 * Suitable for self-hosted, single-node deployments and local dev.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter, StoragePutRequest, StoragePutResult } from "@/lib/adapters/types";

const ROOT = process.env.STORAGE_LOCAL_ROOT ?? "./storage";

function safeKey(orgId: string, key: string): string {
  // No traversal: drop ../ segments, restrict to alnum + safe punctuation.
  const cleaned = key.split("/").filter((p) => p && p !== ".." && p !== ".").join("/");
  return path.join(ROOT, orgId, cleaned);
}

export const localStorageAdapter: StorageAdapter = {
  id: "local",

  isConfigured() {
    return true;
  },

  async put(req: StoragePutRequest): Promise<StoragePutResult> {
    const target = safeKey(req.orgId, req.key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(req.body));
    return { uri: `file://${path.resolve(target)}`, publicUrl: null };
  },

  async signedUrl(uri: string, _ttl: number): Promise<string> {
    // Local files have no signed-URL concept; return file:// for staff/CLI use.
    return uri;
  },
};
