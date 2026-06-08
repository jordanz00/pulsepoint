"use client";

import { useState } from "react";

export function CopyRegistrationLink({
  registrationUrl,
  label = "Copy registration link",
}: {
  registrationUrl: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="pc-btn-secondary text-sm min-h-11"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(registrationUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy registration link:", registrationUrl);
        }
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
