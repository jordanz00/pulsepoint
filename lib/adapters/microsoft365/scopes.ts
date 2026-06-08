/**
 * Microsoft Graph delegated scopes — single source for OAuth authorize + token exchange.
 */

export const M365_DELEGATED_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "User.Read",
  "Mail.Read",
  "Calendars.Read",
  "Contacts.Read",
] as const;

export const M365_SCOPE_STRING = M365_DELEGATED_SCOPES.join(" ");
