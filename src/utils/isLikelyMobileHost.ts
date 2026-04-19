/**
 * Returns true when the current environment looks like a phone or small tablet —
 * the primary pointer is coarse AND the viewport is narrow.
 *
 * Uses matchMedia so it reflects the runtime viewport, not a UA string.
 * SSR-safe: returns false when window/matchMedia are unavailable.
 *
 * Intended as a gate for "become the host" flows, since the big-screen layout
 * is designed for a TV/desktop.
 */
export function isLikelyMobileHost(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(pointer: coarse) and (max-width: 900px)").matches;
}
