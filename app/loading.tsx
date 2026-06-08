export default function GlobalLoading() {
  return (
    <div
      className="pp-canvas"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className="pp-sidebar-org-mark"
        style={{ width: 48, height: 48, fontSize: 16 }}
        aria-hidden
      >
        PP
      </div>
      <p className="page-subtitle">Loading PulsePoint…</p>
      <div style={{ display: "flex", gap: 6 }} aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="skeleton"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
