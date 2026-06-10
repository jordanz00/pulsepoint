import type { ReactNode } from "react";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

export function EmptyState({
  title,
  description,
  action,
  variant = "empty",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "empty" | "clear";
}) {
  return (
    <EnterpriseStatePanel
      variant={variant}
      title={title}
      description={description}
      action={action}
    />
  );
}
