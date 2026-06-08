"use client";

import { useMemo } from "react";

export function ProspectorBookmarklet({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const bookmarklet = useMemo(() => {
    const panel = `/${orgSlug}/crm/prospector/panel`;
    const script = `(function(){
  var e=prompt("Email on this page (optional):","");
  window.open(location.origin+"${panel}?email="+encodeURIComponent(e||"")+"&pageUrl="+encodeURIComponent(location.href),"_blank","width=420,height=720");
})();`;
    return `javascript:${encodeURIComponent(script)}`;
  }, [orgSlug]);

  return (
    <div className="pc-card p-4">
      <h2 className="pc-section-title">Bookmarklet</h2>
      <p className="pc-section-lead mt-1">
        Drag to your bookmarks bar — opens Prospector panel with the current page URL. Configure
        capture token in the panel for save actions.
      </p>
      <a
        href={bookmarklet}
        className="pc-btn-primary mt-4 inline-block text-sm"
        onClick={(e) => e.preventDefault()}
      >
        PulsePoint Prospector
      </a>
      <p className="mt-2 text-xs text-zinc-400">Org id for API: {orgId}</p>
    </div>
  );
}
