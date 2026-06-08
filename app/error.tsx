"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div
      className="pp-canvas"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div className="glass glass-lg card" style={{ maxWidth: 480, width: "100%" }}>
        <div className="card-body">
          <h1 className="page-title">Something went wrong</h1>
          <p className="page-subtitle" style={{ marginTop: 8 }}>
            We could not load this page. Try again or return home.
          </p>
          {isDev ? (
            <pre
              style={{
                marginTop: 16,
                padding: 12,
                fontSize: 11,
                overflow: "auto",
                borderRadius: "var(--r-md)",
                background: "var(--glass-bg)",
                color: "var(--text-muted)",
              }}
            >
              {error.message}
            </pre>
          ) : null}
          <div className="page-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-primary" onClick={() => reset()}>
              Try again
            </button>
            <a href="/" className="btn btn-ghost">
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
