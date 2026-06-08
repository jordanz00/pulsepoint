/**
 * Pre-designed email sequence templates — Nimble sequence templates (association-adapted).
 */

export type SequenceTemplateStep = {
  stepOrder: number;
  delayDays: number;
  subject: string;
  bodyText: string;
};

export type SequenceTemplate = {
  key: string;
  name: string;
  description: string;
  department: string;
  steps: SequenceTemplateStep[];
};

export const EMAIL_SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  {
    key: "new_member_welcome",
    name: "New member welcome series",
    description: "Three-touch welcome after join or directory signup.",
    department: "Membership",
    steps: [
      {
        stepOrder: 0,
        delayDays: 0,
        subject: "Welcome to the association",
        bodyText:
          "Hi — thanks for joining. Here is how to get the most from your membership this week.",
      },
      {
        stepOrder: 1,
        delayDays: 3,
        subject: "Complete your profile",
        bodyText: "A quick reminder to finish your directory profile so peers can find you.",
      },
      {
        stepOrder: 2,
        delayDays: 7,
        subject: "Your first event",
        bodyText: "We would love to see you at an upcoming program — reply if you want recommendations.",
      },
    ],
  },
  {
    key: "lapsed_reengage",
    name: "Re-engage lapsed members",
    description: "Warm outreach when status lapses or engagement drops.",
    department: "Membership",
    steps: [
      {
        stepOrder: 0,
        delayDays: 0,
        subject: "We miss you",
        bodyText: "Your membership matters to our community. Can we help with renewal or questions?",
      },
      {
        stepOrder: 1,
        delayDays: 5,
        subject: "Quick check-in",
        bodyText: "Following up — happy to schedule a short call with our team.",
      },
    ],
  },
  {
    key: "sponsor_nurture",
    name: "Sponsor nurture sequence",
    description: "Partnership outreach from first interest to proposal.",
    department: "Development",
    steps: [
      {
        stepOrder: 0,
        delayDays: 0,
        subject: "Partnership opportunities",
        bodyText: "Thanks for your interest in supporting our mission. Attached is our overview deck.",
      },
      {
        stepOrder: 1,
        delayDays: 4,
        subject: "Next steps for collaboration",
        bodyText: "Would a 20-minute call next week work to align on goals and tiers?",
      },
    ],
  },
];
