"use client";

import { useEffect } from "react";

/**
 * Root layout error boundary — shows visible UI instead of a blank screen.
 */
export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#0b1220",
          color: "#f8fafc",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>PulsePoint could not load</h1>
          <p style={{ color: "#94a3b8", lineHeight: 1.5 }}>
            The page hit an error. Restart the dev server with{" "}
            <code style={{ color: "#e2e8f0" }}>pnpm dev</code> from{" "}
            <code style={{ color: "#e2e8f0" }}>/Users/jordanzabady/Desktop/pulse</code>.
          </p>
          {process.env.NODE_ENV === "development" ? (
            <pre
              style={{
                marginTop: 16,
                padding: 12,
                fontSize: 11,
                overflow: "auto",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                color: "#cbd5e1",
              }}
            >
              {error.message}
            </pre>
          ) : null}
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#0072bc",
                color: "#fff",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                color: "#93c5fd",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
