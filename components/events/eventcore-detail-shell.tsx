"use client";

import { useMemo, useState, type ReactNode } from "react";

export type EventCoreTab =
  | "overview"
  | "attendees"
  | "program"
  | "tickets"
  | "sponsors"
  | "sessions"
  | "marketing"
  | "email"
  | "schedule"
  | "surveys"
  | "badges"
  | "website"
  | "analytics"
  | "planner"
  | "settings";

type TabDef = { id: EventCoreTab; label: string };

const TAB_GROUPS: { id: string; label: string; tabs: TabDef[] }[] = [
  {
    id: "core",
    label: "Core",
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "attendees", label: "Attendees" },
      { id: "analytics", label: "Analytics" },
    ],
  },
  {
    id: "program",
    label: "Program",
    tabs: [
      { id: "program", label: "Program" },
      { id: "sessions", label: "Sessions" },
      { id: "sponsors", label: "Assets" },
      { id: "planner", label: "Planner" },
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    tabs: [
      { id: "tickets", label: "Tickets" },
      { id: "marketing", label: "Marketing" },
    ],
  },
  {
    id: "comms",
    label: "Communications",
    tabs: [
      { id: "email", label: "Email" },
      { id: "schedule", label: "Scheduled" },
      { id: "surveys", label: "Surveys" },
    ],
  },
  {
    id: "ops",
    label: "Day-of",
    tabs: [
      { id: "badges", label: "Badges" },
      { id: "website", label: "Website export" },
      { id: "settings", label: "Settings" },
    ],
  },
];

function findGroupForTab(tab: EventCoreTab): string {
  for (const g of TAB_GROUPS) {
    if (g.tabs.some((t) => t.id === tab)) return g.id;
  }
  return TAB_GROUPS[0]!.id;
}

const VALID_TABS = new Set<EventCoreTab>([
  "overview",
  "attendees",
  "program",
  "tickets",
  "sponsors",
  "sessions",
  "marketing",
  "email",
  "schedule",
  "surveys",
  "badges",
  "website",
  "analytics",
  "planner",
  "settings",
]);

export function EventCoreDetailShell({
  panels,
  summary,
  initialTab = "overview",
}: {
  panels: Record<EventCoreTab, ReactNode>;
  summary?: ReactNode;
  initialTab?: EventCoreTab;
}) {
  const startTab = VALID_TABS.has(initialTab) ? initialTab : "overview";
  const [tab, setTab] = useState<EventCoreTab>(startTab);
  const [groupId, setGroupId] = useState(() => findGroupForTab(startTab));

  const activeGroup = useMemo(
    () => TAB_GROUPS.find((g) => g.id === groupId) ?? TAB_GROUPS[0]!,
    [groupId],
  );

  function selectGroup(id: string) {
    setGroupId(id);
    const g = TAB_GROUPS.find((x) => x.id === id);
    if (g && !g.tabs.some((t) => t.id === tab)) {
      setTab(g.tabs[0]!.id);
    }
  }

  function selectTab(id: EventCoreTab) {
    setTab(id);
    setGroupId(findGroupForTab(id));
  }

  return (
    <div className="ec-detail-shell">
      {summary ? <div className="ec-detail-summary">{summary}</div> : null}

      <nav className="ec-tab-groups" aria-label="EventCore section groups">
        {TAB_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`ec-tab-group${groupId === g.id ? " ec-tab-group--active" : ""}`}
            aria-pressed={groupId === g.id}
            onClick={() => selectGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <nav
        className="ec-tabs ec-tabs--scroll"
        role="tablist"
        aria-label={`${activeGroup.label} sections`}
      >
        {activeGroup.tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`ec-tab${tab === t.id ? " ec-tab--active" : ""}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="ec-tab-panel ec-tab-panel--animate" role="tabpanel" key={tab}>
        {panels[tab]}
      </div>
    </div>
  );
}
