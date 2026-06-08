"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getMembers, type MemberListRow } from "@/app/actions/members";
import { memberTagsArray } from "@/lib/member-tags";

const ROW_HEIGHT = 52;

export function MemberDirectoryVirtual({
  orgSlug,
  initialMembers,
  initialCursor,
  initialTotal,
  canExport,
}: {
  orgSlug: string;
  initialMembers: MemberListRow[];
  initialCursor: string | null;
  initialTotal: number;
  canExport: boolean;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState(initialMembers);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "INACTIVE" | "LAPSED">("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await getMembers(
      {
        take: 50,
        q: debouncedQ || undefined,
        status: status || undefined,
        orderBy: "name",
      },
      orgSlug,
    );
    setLoading(false);
    if (res.ok && res.data) {
      setMembers(res.data.members);
      setCursor(res.data.nextCursor);
      setTotalCount(res.data.totalCount);
    }
  }, [debouncedQ, orgSlug, status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const res = await getMembers(
      {
        cursor,
        take: 50,
        q: debouncedQ || undefined,
        status: status || undefined,
        orderBy: "name",
      },
      orgSlug,
    );
    setLoadingMore(false);
    if (res.ok && res.data) {
      setMembers((prev) => [...prev, ...res.data!.members]);
      setCursor(res.data.nextCursor);
    }
  };

  const virtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const statusPills = useMemo(
    () =>
      [
        { id: "", label: "All" },
        { id: "ACTIVE", label: "Active" },
        { id: "INACTIVE", label: "Inactive" },
        { id: "LAPSED", label: "Lapsed" },
      ] as const,
    [],
  );

  return (
    <div className="card glass">
      <div className="filter-bar">
        <input
          className="input-base search-input"
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search members"
        />
        <div className="tab-bar" role="group" aria-label="Status filter">
          {statusPills.map((pill) => (
            <button
              key={pill.id || "all"}
              type="button"
              className={`tab-item${status === pill.id ? " active" : ""}`}
              onClick={() => setStatus(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <span className="page-subtitle" style={{ marginLeft: "auto" }}>
          {loading ? "Searching…" : `${totalCount.toLocaleString()} members`}
        </span>
        {canExport ? (
          <Link href={`/${orgSlug}/members`} className="btn btn-secondary btn-sm">
            Export CSV
          </Link>
        ) : null}
        <Link href={`/${orgSlug}/members/new`} className="btn btn-primary btn-sm">
          Add member
        </Link>
      </div>

      <div className="pc-table-wrap member-directory-table">
        <table className="pc-table data-table-fixed">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Joined</th>
              <th>Updated</th>
            </tr>
          </thead>
        </table>
        <div
          ref={parentRef}
          style={{ height: "min(600px, 70vh)", overflow: "auto" }}
          className="member-directory-scroll"
        >
          {members.length === 0 && !loading ? (
            <div className="empty-state">
              <p className="empty-state-title">No members match</p>
              <p className="empty-state-desc">
                Adjust search or filters, or add your first member.
              </p>
              <Link href={`/${orgSlug}/members/new`} className="btn btn-primary">
                Add member
              </Link>
            </div>
          ) : (
            <div
              style={{
                height: virtualizer.getTotalSize(),
                position: "relative",
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((vRow) => {
                const m = members[vRow.index];
                if (!m) return null;
                const tags = memberTagsArray(m.tags);
                return (
                  <Link
                    key={m.id}
                    href={`/${orgSlug}/members/${m.id}`}
                    className="member-directory-row"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: ROW_HEIGHT,
                      transform: `translateY(${vRow.start}px)`,
                    }}
                  >
                    <span className="member-directory-cell member-directory-cell--name">
                      <strong>
                        {m.firstName} {m.lastName}
                      </strong>
                      <span className="member-directory-email">{m.email ?? "No email"}</span>
                    </span>
                    <span className="member-directory-cell member-directory-cell--status">
                      <span
                        className={
                          m.status === "ACTIVE"
                            ? "badge badge-live"
                            : m.status === "LAPSED"
                              ? "badge badge-roadmap"
                              : "badge badge-alpha"
                        }
                      >
                        {m.status}
                      </span>
                    </span>
                    <span className="member-directory-cell member-directory-cell--tags">
                      {tags.slice(0, 2).join(", ") || "—"}
                    </span>
                    <span className="member-directory-cell member-directory-cell--joined">
                      {new Date(m.createdAt).toISOString().slice(0, 10)}
                    </span>
                    <span className="member-directory-cell member-directory-cell--updated">
                      {new Date(m.updatedAt).toISOString().slice(0, 10)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {cursor ? (
        <div style={{ padding: 16, textAlign: "center" }}>
          <button
            type="button"
            className="btn btn-secondary min-h-11"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? "Loading…" : "Load 50 more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
