/**
 * CMS adapter types — EasyDNN (DNN) primary, generic HTML fallback.
 */

export type EasyDnnSiteConfig = {
  siteUrl: string;
  portalId?: number;
  eventsPagePath?: string;
  memberDirectoryPath?: string;
  /** When true, registration CTAs use PulsePoint public URLs */
  registrationMode: "pulsepoint" | "dnn_redirect";
  lastPublishedAt?: string;
};

export type EasyDnnExportInput = {
  orgName: string;
  orgSlug: string;
  event: {
    title: string;
    description: string;
    startsAt: Date;
    endsAt: Date | null;
    publicSlug: string;
    venueName: string;
    format: string;
  };
  registrationUrl: string;
  accent: string;
  heroImage?: string;
  logoUrl?: string;
  speakers: { name: string; title: string; role: string }[];
  sponsors: { name: string; tier: string; logoUrl: string; boothNumber: string }[];
  sessions: { title: string; startsAt: Date; room: string; track: string }[];
  /** Optional EasyDNN site base for manifest deep links */
  siteConfig?: EasyDnnSiteConfig | null;
};

export type EasyDnnExportBundle = {
  version: "1.1";
  generatedAt: string;
  moduleHtml: string;
  manifest: {
    title: string;
    registrationUrl: string;
    dnnSiteUrl?: string;
    assets: { label: string; url: string }[];
    instructions: string[];
  };
};

export type MemberDirectoryExportInput = {
  orgName: string;
  members: Array<{ name: string; title: string; organization: string }>;
  siteConfig?: EasyDnnSiteConfig | null;
};

export type CmsPublishResult = {
  adapterId: "easydnn" | "generic-html";
  bundle: EasyDnnExportBundle;
};

export interface CmsAdapter {
  readonly id: string;
  isConfigured(orgId: string): Promise<boolean>;
  buildEventModule(input: EasyDnnExportInput): EasyDnnExportBundle;
  buildMemberDirectoryModule(input: MemberDirectoryExportInput): EasyDnnExportBundle;
}
