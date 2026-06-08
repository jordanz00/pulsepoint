"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Auto-advancing carousel index for marketing previews — pauses on hover or manual pick.
 */
export function usePreviewCarousel(
  length: number,
  intervalMs: number,
  reduced: boolean,
  externalPaused = false,
) {
  const [index, setIndex] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const paused = manualPause || externalPaused;

  useEffect(() => {
    if (reduced || paused || length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [reduced, paused, length, intervalMs]);

  const pick = useCallback(
    (i: number) => {
      setIndex(i % length);
      setManualPause(true);
    },
    [length],
  );

  const pause = useCallback(() => setManualPause(true), []);
  const resume = useCallback(() => setManualPause(false), []);

  return { index, pick, paused: manualPause, pause, resume, manualPause };
}
