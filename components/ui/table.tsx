import type { HTMLAttributes, ReactNode } from "react";

export function TableWrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`ds-table-wrap ${className}`.trim()}>{children}</div>;
}

export function Table({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <table className={`ds-table ${className}`.trim()} {...props}>
      {children}
    </table>
  );
}
