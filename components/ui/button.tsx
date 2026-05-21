import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-[var(--pc-navy)] text-white hover:bg-[var(--pc-navy-elevated)] disabled:opacity-50",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
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
