import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-[var(--pc-brand)] text-white hover:bg-[var(--pc-brand-hover)] disabled:opacity-50",
  secondary:
    "border border-[var(--pc-border-strong)] bg-white text-[var(--pc-text)] hover:bg-[var(--pc-bg)]",
  ghost: "text-[var(--pc-text-secondary)] hover:bg-[var(--pc-bg)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
