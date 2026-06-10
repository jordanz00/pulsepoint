import type { ReactNode } from "react";

export type EnterpriseStateVariant = "empty" | "loading" | "error" | "success" | "clear";

const VARIANT_LABEL: Record<EnterpriseStateVariant, string> = {
  empty: "Nothing here yet",
  loading: "Loading",
  error: "Something went wrong",
  success: "Complete",
  clear: "All clear",
};

/** Enterprise empty / loading / error / success surfaces (Sprint 8). */
export function EnterpriseStatePanel({
  variant = "empty",
  title,
  description,
  action,
  className = "",
}: {
  variant?: EnterpriseStateVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  const resolvedTitle = title ?? VARIANT_LABEL[variant];

  return (
    <div
      className={`pp-enterprise-state pp-enterprise-state--${variant} glass pp-glass-surface ${className}`.trim()}
      role={variant === "error" ? "alert" : variant === "loading" ? "status" : undefined}
      aria-busy={variant === "loading" ? true : undefined}
    >
      <span className="pp-enterprise-state__icon" aria-hidden>
        {variant === "loading" ? "…" : variant === "error" ? "!" : variant === "success" ? "✓" : "○"}
      </span>
      <p className="pp-enterprise-state__title">{resolvedTitle}</p>
      {description ? <p className="pp-enterprise-state__detail">{description}</p> : null}
      {action ? <div className="pp-enterprise-state__action">{action}</div> : null}
    </div>
  );
}
