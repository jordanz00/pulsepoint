"use client";

import { useState, useTransition } from "react";
import {
  exportMemberDirectoryToEasyDnn,
  saveEasyDnnSiteConfig,
} from "@/app/actions/integrations";
import type { EasyDnnSiteConfig } from "@/lib/adapters/cms/types";

type Props = {
  orgSlug: string;
  config: EasyDnnSiteConfig | null;
};

export function EasyDnnConnectPanel({ orgSlug, config }: Props) {
  const [siteUrl, setSiteUrl] = useState(config?.siteUrl ?? "");
  const [eventsPath, setEventsPath] = useState(config?.eventsPagePath ?? "/events");
  const [directoryPath, setDirectoryPath] = useState(
    config?.memberDirectoryPath ?? "/members",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [exportHtml, setExportHtml] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      setMessage(null);
      const res = await saveEasyDnnSiteConfig(orgSlug, {
        siteUrl,
        eventsPagePath: eventsPath,
        memberDirectoryPath: directoryPath,
        registrationMode: "pulsepoint",
      });
      setMessage(res.ok ? "EasyDNN site saved." : (res.error ?? "Save failed"));
    });
  }

  function handleDirectoryExport() {
    startTransition(async () => {
      setMessage(null);
      setExportHtml(null);
      const res = await exportMemberDirectoryToEasyDnn(orgSlug);
      if (!res.ok) {
        setMessage(res.error ?? "Export failed");
        return;
      }
      setExportHtml(res.bundle.moduleHtml);
      setMessage("Member directory HTML ready — copy into EasyDNN HTML module.");
    });
  }

  return (
    <div className="pc-glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-semibold">EasyDNN CMS</h2>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">
        Connect your DotNetNuke / EasyDNN public site. Export HTML modules for events and member
        directory — paste into EasyDNN HTML Pro modules.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            Site URL (https)
          </span>
          <input
            className="pc-input mt-1 w-full"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://www.your-association.org"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            Events page path
          </span>
          <input
            className="pc-input mt-1 w-full"
            value={eventsPath}
            onChange={(e) => setEventsPath(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            Directory page path
          </span>
          <input
            className="pc-input mt-1 w-full"
            value={directoryPath}
            onChange={(e) => setDirectoryPath(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="pc-btn-primary" onClick={handleSave} disabled={pending}>
          Save site config
        </button>
        <button
          type="button"
          className="pc-btn-secondary"
          onClick={handleDirectoryExport}
          disabled={pending || !siteUrl}
        >
          Export member directory HTML
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-[var(--fg-muted)]" role="status">
          {message}
        </p>
      ) : null}

      {exportHtml ? (
        <textarea
          className="pc-input mt-4 h-40 w-full font-mono text-xs"
          readOnly
          value={exportHtml}
          aria-label="EasyDNN HTML export"
        />
      ) : null}
    </div>
  );
}
