/**
 * Map internal auth errors to safe client messages (no stack leaks).
 */

export function messageFromActionError(e: unknown): string {
  if (!(e instanceof Error)) return "Something went wrong";
  switch (e.message) {
    case "UNAUTHORIZED":
      return "Sign in required";
    case "NO_ACTIVE_ORG":
      return "Select an organization";
    case "NOT_ORG_MEMBER":
      return "Not a member of this organization";
    case "FORBIDDEN":
      return "Insufficient permissions";
    case "ORG_MISMATCH":
      return "Organization mismatch — refresh and try again";
    default:
      return "Something went wrong";
  }
}
