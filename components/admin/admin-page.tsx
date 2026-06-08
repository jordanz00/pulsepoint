import type { ReactNode } from "react";
import { isEasyAdminMode } from "@/lib/admin-page-copy";

/** Consistent width, spacing, and large type for easy admin screens. */
export function AdminPage({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: ReactNode;
}) {
  const easy = isEasyAdminMode(orgSlug);
  return (
    <div className={easy ? "pc-admin-page pc-admin-simple" : "pc-admin-page space-y-8"}>
      {children}
    </div>
  );
}
