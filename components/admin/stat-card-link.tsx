"use client";

import Link from "next/link";
import { HelpTip } from "@/components/ui/help-tip";

export function StatCardLink({
  href,
  label,
  value,
  help,
  showHelp = true,
}: {
  href: string;
  label: string;
  value: string | number;
  help: string;
  showHelp?: boolean;
}) {
  return (
    <Link href={href} className="pc-stat-card group">
      <p className="pc-stat-label flex items-center">
        {label}
        {showHelp ? <HelpTip text={help} /> : null}
      </p>
      <p className="pc-stat-value">{value}</p>
    </Link>
  );
}
