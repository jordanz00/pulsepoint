import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary: "ds-btn ds-btn--primary",
  secondary: "ds-btn ds-btn--secondary",
  ghost: "ds-btn ds-btn--ghost",
  danger: "ds-btn ds-btn--danger",
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "ds-btn--sm",
  md: "",
  lg: "ds-btn--lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
