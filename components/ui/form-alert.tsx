import type { ReactNode } from "react";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, string> = {
  error: "border-[var(--accent-danger)]/20 bg-red-50 text-red-800",
  success: "border-[var(--accent-positive)]/20 bg-emerald-50 text-emerald-900",
  info: "border-[var(--border-muted)] bg-[var(--bg-elevated)] text-[var(--fg-muted)]",
};

/**
 * Form-level message — announced politely to screen readers.
 */
export function FormAlert({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-lg border px-3 py-2 text-sm ${styles[variant]}`}
    >
      {children}
    </p>
  );
}
