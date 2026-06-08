/**
 * S3-compatible storage adapter — works with:
 *   - AWS S3
 *   - Cloudflare R2 (no egress fees)
 *   - Backblaze B2 S3-compatible
 *   - Wasabi
 *   - MinIO (self-hosted)
 *
 * Pick any of the above with the same code by setting:
 *   STORAGE_S3_ENDPOINT, STORAGE_S3_REGION, STORAGE_S3_BUCKET,
 *   STORAGE_S3_ACCESS_KEY_ID, STORAGE_S3_SECRET_ACCESS_KEY
 *
 * @aws-sdk/client-s3 + s3-request-presigner are real deps so the adapter works
 * the moment env vars are set — no separate install step.
 */

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  StorageAdapter,
  StoragePutRequest,
  StoragePutResult,
} from "@/lib/adapters/types";

function safeKey(orgId: string, key: string): string {
  const cleaned = key
    .split("/")
    .filter((p) => p && p !== ".." && p !== ".")
    .join("/");
  return `${orgId}/${cleaned}`;
}

function buildClient(): S3Client {
  return new S3Client({
    endpoint: process.env.STORAGE_S3_ENDPOINT,
    region: process.env.STORAGE_S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === "true",
  });
}

export const s3StorageAdapter: StorageAdapter = {
  id: "s3",

  isConfigured() {
    return Boolean(
      process.env.STORAGE_S3_BUCKET &&
        process.env.STORAGE_S3_ACCESS_KEY_ID &&
        process.env.STORAGE_S3_SECRET_ACCESS_KEY,
    );
  },

  async put(req: StoragePutRequest): Promise<StoragePutResult> {
    const client = buildClient();
    const Key = safeKey(req.orgId, req.key);
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_S3_BUCKET!,
        Key,
        Body: Buffer.from(req.body),
        ContentType: req.contentType,
      }),
    );
    return {
      uri: `s3://${process.env.STORAGE_S3_BUCKET}/${Key}`,
      publicUrl: null,
    };
  },

  async signedUrl(uri: string, ttlSeconds: number): Promise<string> {
    const m = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!m) throw new Error(`unrecognized s3 uri: ${uri}`);
    const [, bucket, key] = m;
    const client = buildClient();
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: ttlSeconds },
    );
  },
};
