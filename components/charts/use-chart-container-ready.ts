"use client";

import { useEffect, useState } from "react";

/** Avoid Recharts width/height -1 when parent has no layout yet (SSR / first paint). */
export function useChartContainerReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
