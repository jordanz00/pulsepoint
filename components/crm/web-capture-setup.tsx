"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createWebCaptureKey } from "@/app/actions/crm";

export function WebCaptureSetup({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function generate() {
    setPending(true);
    const result = await createWebCaptureKey(orgSlug);
    setPending(false);
    if (result.ok && result.data) setToken(result.data.token);
  }

  const snippet = token
    ? `fetch("${typeof window !== "undefined" ? window.location.origin : ""}/api/crm/capture", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-PulsePoint-Org-Id": "${orgId}",
    "X-PulsePoint-Capture-Token": "${token}",
  },
  body: JSON.stringify({
    firstName: "Jane",
    lastName: "Rivera",
    email: "jane@example.org",
    company: "Acme Health",
    jobTitle: "CEO",
    linkedInUrl: "https://www.linkedin.com/in/jane-rivera",
    captureKind: "WEB_CAPTURE",
    sourceLabel: "LinkedIn profile",
  }),
});`
    : null;

  return (
    <div className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold">Works everywhere</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Capture contacts from your inbox, LinkedIn, or any webpage via API token. Browser extension
        ships as a follow-on; the capture endpoint is live today.
      </p>
      <Button type="button" className="mt-4" onClick={generate} disabled={pending}>
        {pending ? "Generating…" : "Generate capture token"}
      </Button>
      {token ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-zinc-700">
            Token (copy once — stored hashed server-side):
          </p>
          <code className="block break-all rounded bg-zinc-900 px-3 py-2 text-xs text-green-100">
            {token}
          </code>
          <p className="text-sm font-medium text-zinc-700">Example request:</p>
          <pre className="max-h-64 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{snippet}</pre>
        </div>
      ) : null}
    </div>
  );
}
