/**
 * Typed AMS error class — carries an error code + HTTP status.
 *
 * WHO THIS IS FOR: services + plugins that need to surface a known error
 *   code (AMS_PERM_005, AMS_VAL_003, etc.) without resorting to ad-hoc
 *   `(err as { code: string }).code = "..."` assignments.
 * WHAT IT DOES: Single Error subclass with `code`, `status`, and optional
 *   `details` (already-redacted summary safe to log/return).
 * HOW IT CONNECTS: server.ts global error handler matches on `instanceof
 *   AmsError` first; other code paths can still throw plain Errors.
 */

export class AmsError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "AmsError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Convenience constructors for the common cases. */
export const Errors = {
  unauthorized: (message = "Unauthenticated") =>
    new AmsError("AMS_AUTH_001", message, 401),
  forbidden: (message = "Permission denied") =>
    new AmsError("AMS_PERM_005", message, 403),
  notFound: (message = "Not found") => new AmsError("AMS_NOT_FOUND", message, 404),
  badRequest: (code: string, message: string) => new AmsError(code, message, 400),
  conflict: (code: string, message: string) => new AmsError(code, message, 409),
  rateLimited: (message = "Too many requests") =>
    new AmsError("AMS_RATE_LIMIT", message, 429),
};
