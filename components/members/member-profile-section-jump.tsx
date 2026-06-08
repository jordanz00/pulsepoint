"use client";

import type { ReactNode } from "react";
import type { MemberProfileTab } from "@/lib/member-profile/types";
import { useMemberProfileTabNav } from "@/components/members/member-profile-tab-context";

export function MemberProfileSectionJump({
  tab,
  children,
}: {
  tab: MemberProfileTab;
  children: ReactNode;
}) {
  const navigate = useMemberProfileTabNav();

  return (
    <button
      type="button"
      className="mc-profile-jump-link"
      onClick={() => navigate?.(tab)}
    >
      {children}
    </button>
  );
}
