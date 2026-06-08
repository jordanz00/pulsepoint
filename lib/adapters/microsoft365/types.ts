/**
 * Microsoft 365 integration types — Graph API surface for PulsePoint.
 */

export type GraphMailThread = {
  id: string;
  subject: string;
  from: string;
  preview: string;
  receivedAt: string;
  isRead: boolean;
};

export type GraphCalendarEvent = {
  id: string;
  subject: string;
  start: string;
  end: string;
  location: string;
  isOnline: boolean;
};

export type GraphContact = {
  id: string;
  displayName: string;
  email: string | null;
  company: string | null;
};

export type Microsoft365SyncResult = {
  mailThreads: GraphMailThread[];
  calendarEvents: GraphCalendarEvent[];
  contacts: GraphContact[];
  syncedAt: string;
};

export type Microsoft365ConnectionConfig = {
  refreshToken?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  mailThreads?: GraphMailThread[];
  calendarEvents?: GraphCalendarEvent[];
  contacts?: GraphContact[];
  lastSyncAt?: string;
};

export type GraphConfig = {
  clientId: string;
  clientSecret: string | null;
  redirectUri: string;
  tenantId: string;
};

export interface Microsoft365Adapter {
  readonly id: "microsoft365";
  isConfigured(): boolean;
  getAuthorizeUrl(state: string): string;
  exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string | null;
    expiresIn: number;
  }>;
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string | null;
    expiresIn: number;
  }>;
  syncAll(accessToken: string): Promise<Microsoft365SyncResult>;
}
