/**
 * Web capture keys — hash tokens for browser extension / bookmarklet.
 */

import { createHash, randomBytes } from "node:crypto";

export function generateCaptureToken(): { token: string; keyHash: string } {
  const token = randomBytes(24).toString("base64url");
  const keyHash = hashCaptureToken(token);
  return { token, keyHash };
}

export function hashCaptureToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
