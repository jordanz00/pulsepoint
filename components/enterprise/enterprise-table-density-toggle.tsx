"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pp-table-density";

/** Client density toggle — applies class on nearest .pp-data-table-shell. */
export function EnterpriseTableDensityToggle({
  defaultDensity = "comfortable",
}: {
  defaultDensity?: "compact" | "comfortable";
}) {
  const [density, setDensity] = useState<"compact" | "comfortable">(defaultDensity);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "compact" || stored === "comfortable") {
        setDensity(stored);
      }
    } catch {
      /* IT-safe: ignore */
    }
  }, []);

  useEffect(() => {
    const tables = document.querySelectorAll<HTMLTableElement>(".pp-data-table");
    tables.forEach((table) => {
      table.classList.remove("pp-data-table--compact", "pp-data-table--comfortable");
      table.classList.add(`pp-data-table--${density}`);
      table.setAttribute("data-density", density);
    });
    try {
      localStorage.setItem(STORAGE_KEY, density);
    } catch {
      /* ignore */
    }
  }, [density]);

  return (
    <div className="pp-data-table-density" role="group" aria-label="Table density">
      <button
        type="button"
        className={`pp-data-table-density__btn${density === "comfortable" ? " is-active" : ""}`}
        onClick={() => setDensity("comfortable")}
      >
        Comfortable
      </button>
      <button
        type="button"
        className={`pp-data-table-density__btn${density === "compact" ? " is-active" : ""}`}
        onClick={() => setDensity("compact")}
      >
        Compact
      </button>
    </div>
  );
}
