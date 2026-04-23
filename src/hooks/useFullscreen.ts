import { useCallback, useEffect, useState } from "react";

/** Return value of `useFullscreen`. */
export interface UseFullscreenResult {
  /** True when the page is currently in fullscreen. Stays in sync with browser ESC / UI exits. */
  isFullscreen: boolean;
  /** False on platforms without the Fullscreen API (e.g. iPhone Safari) and during SSR. */
  isSupported: boolean;
  /** Toggles fullscreen on `document.documentElement`. No-op when unsupported. */
  toggle: () => void;
}

/**
 * React hook that exposes the Fullscreen API for the whole page.
 * Subscribes to `fullscreenchange` so `isFullscreen` reflects ESC and browser-UI exits.
 * @example
 * const { isFullscreen, isSupported, toggle } = useFullscreen();
 * if (!isSupported) return null;
 * return <button onClick={toggle}>{isFullscreen ? "Exit" : "Enter"} fullscreen</button>;
 */
export function useFullscreen(): UseFullscreenResult {
  const isSupported =
    typeof document !== "undefined" && document.fullscreenEnabled === true;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== "undefined" && document.fullscreenElement !== null,
  );

  useEffect(() => {
    if (!isSupported) return;
    const handler = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [isSupported]);

  const toggle = useCallback(() => {
    if (!isSupported) return;
    if (document.fullscreenElement === null) {
      // Promise rejects without a user gesture or when permission is denied.
      // Nothing useful to do with the error — consumers can't recover from it.
      void document.documentElement.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  }, [isSupported]);

  return { isFullscreen, isSupported, toggle };
}
