"use client";

import { createContext, useContext } from "react";
import type { MemberProfileTab } from "@/lib/member-profile/types";

const MemberProfileTabNavContext = createContext<((tab: MemberProfileTab) => void) | null>(
  null,
);

export function MemberProfileTabNavProvider({
  navigate,
  children,
}: {
  navigate: (tab: MemberProfileTab) => void;
  children: React.ReactNode;
}) {
  return (
    <MemberProfileTabNavContext.Provider value={navigate}>
      {children}
    </MemberProfileTabNavContext.Provider>
  );
}

export function useMemberProfileTabNav(): ((tab: MemberProfileTab) => void) | null {
  return useContext(MemberProfileTabNavContext);
}
