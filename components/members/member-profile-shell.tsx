"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { MemberProfileTab } from "@/lib/member-profile/types";
import { MemberProfileTabNavProvider } from "@/components/members/member-profile-tab-context";

type TabDef = { id: MemberProfileTab; label: string };

const TAB_GROUPS: { id: string; label: string; tabs: TabDef[] }[] = [
  {
    id: "profile",
    label: "Profile",
    tabs: [
      { id: "summary", label: "Summary" },
      { id: "address", label: "Address" },
      { id: "roles", label: "Org roles" },
      { id: "committees", label: "Committees" },
      { id: "roster", label: "Roster" },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    tabs: [
      { id: "engagement", label: "Engagement" },
      { id: "meetings", label: "Meetings" },
      { id: "education", label: "Education" },
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    tabs: [
      { id: "billing", label: "Billing" },
      { id: "store", label: "Store" },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    tabs: [
      { id: "notes", label: "Notes" },
      { id: "crm", label: "Opportunities" },
      { id: "leads", label: "Leads" },
      { id: "comms", label: "Communications" },
      { id: "web", label: "Web" },
    ],
  },
  {
    id: "more",
    label: "More",
    tabs: [
      { id: "activity", label: "Activity" },
      { id: "admin", label: "Admin" },
    ],
  },
];

function findGroupForTab(tab: MemberProfileTab): string {
  for (const g of TAB_GROUPS) {
    if (g.tabs.some((t) => t.id === tab)) return g.id;
  }
  return TAB_GROUPS[0]!.id;
}

export function MemberProfileShell({
  panels,
  summary,
  easy = false,
}: {
  panels: Record<MemberProfileTab, ReactNode>;
  summary?: ReactNode;
  easy?: boolean;
}) {
  const groups = useMemo(() => {
    if (!easy) return TAB_GROUPS;
    return TAB_GROUPS.map((g) =>
      g.id === "more"
        ? { ...g, tabs: g.tabs.filter((t) => t.id !== "admin") }
        : g,
    ).filter((g) => g.tabs.length > 0);
  }, [easy]);

  const [tab, setTab] = useState<MemberProfileTab>("summary");
  const [groupId, setGroupId] = useState(() => findGroupForTab("summary"));

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === groupId) ?? groups[0]!,
    [groupId, groups],
  );

  function selectGroup(id: string) {
    setGroupId(id);
    const g = groups.find((x) => x.id === id);
    if (g && !g.tabs.some((t) => t.id === tab)) {
      setTab(g.tabs[0]!.id);
    }
  }

  function selectTab(id: MemberProfileTab) {
    setTab(id);
    setGroupId(findGroupForTab(id));
  }

  const navigateTab = useCallback((id: MemberProfileTab) => selectTab(id), []);

  return (
    <MemberProfileTabNavProvider navigate={navigateTab}>
    <div className="mc-profile-shell">
      {summary ? <div className="mc-profile-summary">{summary}</div> : null}

      <nav className="mc-profile-tab-groups" aria-label="Member profile section groups">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`mc-profile-tab-group${groupId === g.id ? " mc-profile-tab-group--active" : ""}`}
            aria-pressed={groupId === g.id}
            onClick={() => selectGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <nav
        className="mc-profile-tabs"
        role="tablist"
        aria-label={`${activeGroup.label} sections`}
      >
        {activeGroup.tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`mc-profile-tab${tab === t.id ? " mc-profile-tab--active" : ""}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mc-profile-panel" role="tabpanel" key={tab}>
        {panels[tab]}
      </div>
    </div>
    </MemberProfileTabNavProvider>
  );
}
