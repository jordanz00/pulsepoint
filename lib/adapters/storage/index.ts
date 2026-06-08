/**
 * Storage resolver. Picks S3-compatible when configured, falls back to local FS.
 */

import type { StorageAdapter } from "@/lib/adapters/types";
import { localStorageAdapter } from "@/lib/adapters/storage/local";
import { s3StorageAdapter } from "@/lib/adapters/storage/s3";

export function getActiveStorageAdapter(): StorageAdapter {
  const choice = (process.env.STORAGE_ADAPTER ?? "").toLowerCase();
  if (choice === "local") return localStorageAdapter;
  if (s3StorageAdapter.isConfigured()) return s3StorageAdapter;
  return localStorageAdapter;
}

export { localStorageAdapter, s3StorageAdapter };
