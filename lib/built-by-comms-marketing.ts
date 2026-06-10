/**
 * Built by comms — portfolio story page copy (Week 4 sprint).
 * Honest Live / Alpha / Preview labels throughout.
 */

import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

export const BUILT_BY_COMMS = {
  eyebrow: "Portfolio story",
  headline: "Built by association comms—with AI-assisted engineering.",
  lead: "PulsePoint is a solo-built hospital association AMS demo: advocacy, workforce, events, and board-ready reporting—with honest scope labels on every screen.",
  pitch:
    "I'm a hospital association digital comms producer shipping visible member experience, policy workflows, and executive KPIs—not generic chapter software with hospital features bolted on.",
  disclaimer: "Illustrative demo association · sample data · not production for any live association",
  weeks: [
    {
      id: "week1",
      label: "Week 1",
      title: "Learn video library",
      status: "alpha" as const,
      summary: "YouTube embeds in workforce playlists, public library, Engage persona filter.",
      routes: [
        { href: `/${DEMO_ORG_SLUG}/learn/workforce`, label: "Workforce hub" },
        { href: `/${DEMO_ORG_SLUG}/learn/library`, label: "Public video library" },
      ],
    },
    {
      id: "week2",
      label: "Week 2",
      title: "Advocacy hero media",
      status: "alpha" as const,
      summary: "Issue pages with hero media, printable toolkits, roster-linked take-action.",
      routes: [
        { href: `/${DEMO_ORG_SLUG}/advocacy/issues/nursing-workforce`, label: "Nursing workforce issue" },
        { href: `/${DEMO_ORG_SLUG}/enterprise/advocacy/issues`, label: "Issue hub (staff)" },
      ],
    },
    {
      id: "week3",
      label: "Week 3",
      title: "Virtual career fair booths",
      status: "alpha" as const,
      summary: "Employer booth grid on public event microsite—live chat is roadmap.",
      routes: [
        { href: `/${DEMO_ORG_SLUG}/e/nursing-career-fair-2026`, label: "Public career fair" },
        { href: `/${DEMO_ORG_SLUG}/learn/workforce`, label: "Fair admin shell" },
      ],
    },
    {
      id: "week4",
      label: "Week 4",
      title: "Board briefing pack",
      status: "preview" as const,
      summary: "Print-friendly HTML board export from the same KPI engine as Insights.",
      routes: [
        { href: `/${DEMO_ORG_SLUG}/insights/board-pack`, label: "Board pack (print)" },
        { href: `/${DEMO_ORG_SLUG}/command-center`, label: "Command center" },
      ],
    },
  ],
  masterDemo: [
    { href: `/${DEMO_ORG_SLUG}/flagship`, label: "Flagship 5 hub" },
    { href: `/${DEMO_ORG_SLUG}/flagship/walkthrough?step=0`, label: "5-stop sales walkthrough" },
    { href: "/compare-protech", label: "Honest vs Protech" },
    { href: "/demo", label: "Interactive demo" },
    { href: `/${DEMO_ORG_SLUG}/members/imports`, label: "Roster import staging" },
  ],
} as const;
