import type { ContactRecordData } from "@/lib/contact-record/types";
import type { MemberExtendedFields } from "@/lib/member-profile/extended-fields";
import type { MemberPulseSnapshot } from "@/lib/member-pulse/types";
import type { Member360Profile } from "@/lib/member-360";
import type { MemberRoleRow } from "@/lib/member-roles";

export type MemberProfileCommittee = {
  id: string;
  committeeId: string;
  committeeName: string;
  kind: string;
  title: string;
  termStart: Date | null;
  termEnd: Date | null;
  isCurrent: boolean;
};

export type MemberProfileRosterPeer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  jobTitle: string | null;
  status: string;
};

export type MemberProfileRegistration = {
  id: string;
  eventId: string;
  eventTitle: string;
  status: string;
  paidAt: Date | null;
  checkedInAt: Date | null;
  createdAt: Date;
};

export type MemberProfileOrderLine = {
  productName: string;
  kind: string;
  quantity: number;
  priceCents: number;
};

export type MemberProfileOrder = {
  id: string;
  status: string;
  totalCents: number;
  paidAt: Date | null;
  createdAt: Date;
  lines: MemberProfileOrderLine[];
  isGiftCertificate: boolean;
};

export type MemberProfileSubscription = {
  id: string;
  status: string;
  billingInterval: string;
  nextBillAt: Date;
  tierName: string | null;
  productName: string | null;
};

export type MemberProfileEnrollment = {
  id: string;
  courseTitle: string;
  status: string;
  enrolledAt: Date;
  completedAt: Date | null;
};

export type MemberProfileCeAward = {
  id: string;
  amount: number;
  creditCode: string;
  source: string;
  awardedAt: Date;
  note: string;
};

export type MemberProfileMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  company: string | null;
  jobTitle: string | null;
  linkedInUrl: string | null;
  websiteUrl: string | null;
  relationshipHealth: string;
  lastTouchAt: Date | null;
  nextFollowUpAt: Date | null;
  joinedAt: Date;
  renewalDueAt: Date | null;
  engagementScore: number;
  engagementTier: string;
  tierId: string | null;
  tierName: string | null;
  organizationAccountId: string | null;
  organizationName: string | null;
};

export type MemberProfileData = {
  member: MemberProfileMember;
  tags: string[];
  extended: MemberExtendedFields;
  roles: MemberRoleRow[];
  committees: MemberProfileCommittee[];
  rosterPeers: MemberProfileRosterPeer[];
  registrations: MemberProfileRegistration[];
  subscriptions: MemberProfileSubscription[];
  orders: MemberProfileOrder[];
  invoices: MemberProfileOrder[];
  storeOrders: MemberProfileOrder[];
  giftCertificates: MemberProfileOrder[];
  enrollments: MemberProfileEnrollment[];
  ceAwards: MemberProfileCeAward[];
  profile360: Member360Profile | null;
  pulse: MemberPulseSnapshot | null;
  memberBadges: { code: string; label: string }[];
  contact: ContactRecordData;
};

export type MemberProfileTab =
  | "summary"
  | "address"
  | "roles"
  | "committees"
  | "roster"
  | "engagement"
  | "meetings"
  | "billing"
  | "comms"
  | "web"
  | "notes"
  | "crm"
  | "leads"
  | "education"
  | "store"
  | "activity"
  | "admin";
