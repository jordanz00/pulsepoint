const EXTENSION_PATH = "/extensions/pulsepoint-prospector";

const BROWSERS = [
  { id: "chrome", label: "Chrome", hint: "Load unpacked from repo" },
  { id: "edge", label: "Edge", hint: "Load unpacked (Chromium)" },
  { id: "firefox", label: "Firefox", hint: "about:debugging → Load Temporary" },
  { id: "safari", label: "Safari", hint: "Web Extension (Xcode wrap)" },
] as const;

export function ProspectorInstallCards({ orgSlug }: { orgSlug: string }) {
  const panelPath = `/${orgSlug}/crm/prospector/panel`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BROWSERS.map((b) => (
        <div key={b.id} className="pc-glass-panel rounded-xl p-4">
          <h3 className="font-semibold text-zinc-900">{b.label} extension</h3>
          <p className="mt-1 text-xs text-zinc-500">{b.hint}</p>
          <p className="mt-2 text-sm text-zinc-600">
            Folder: <code className="text-xs">{EXTENSION_PATH}</code>
          </p>
          <a
            href={EXTENSION_PATH}
            className="mt-3 inline-block text-sm font-medium text-[var(--pc-brand)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            View extension files →
          </a>
        </div>
      ))}
      <div className="pc-glass-panel rounded-xl p-4">
        <h3 className="font-semibold text-zinc-900">Outlook add-in</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Use the capture API from Power Automate or VBA with your org token. Full Outlook add-in
          package is a follow-on deliverable.
        </p>
        <a
          href={`/${orgSlug}/crm/everywhere`}
          className="mt-3 inline-block text-sm font-medium text-[var(--pc-brand)]"
        >
          API setup →
        </a>
      </div>
      <div className="pc-glass-panel rounded-xl p-4 sm:col-span-2 lg:col-span-1">
        <h3 className="font-semibold text-zinc-900">Prospector panel</h3>
        <p className="mt-1 text-sm text-zinc-600">Side panel for extension popup:</p>
        <code className="mt-2 block break-all text-xs text-zinc-700">{panelPath}</code>
      </div>
    </div>
  );
}
