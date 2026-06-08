"use client";

import { useState } from "react";
import { publicTakeActionUrl } from "@/lib/advocacy/public-take-action-url";

export function CopyTakeActionLink({
  orgSlug,
  campaignId,
}: {
  orgSlug: string;
  campaignId: string;
}) {
  const [copied, setCopied] = useState(false);
  const path = publicTakeActionUrl(orgSlug, campaignId);

  return (
    <button
      type="button"
      className="pc-btn-secondary text-sm"
      onClick={async () => {
        const url =
          typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy take-action link:", url);
        }
      }}
    >
      {copied ? "Copied" : "Copy public link"}
    </button>
  );
}
