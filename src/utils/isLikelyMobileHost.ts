export interface IsLikelyMobileHostOptions {
  /** Viewport max-width (px) below which a coarse-pointer device counts as "mobile host". Default: 900. */
  maxWidth?: number;
}

/**
 * Returns true when the current environment looks like a phone or small tablet —
 * the primary pointer is coarse AND the viewport is narrow.
 *
 * Uses matchMedia so it reflects the runtime viewport, not a UA string.
 * SSR-safe: returns false when window/matchMedia are unavailable.
 *
 * Intended as a gate for "become the host" flows, since the big-screen layout
 * is designed for a TV/desktop. Raise `maxWidth` if you support a tablet-host path.
 */
export function isLikelyMobileHost(options: IsLikelyMobileHostOptions = {}): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  const maxWidth = options.maxWidth ?? 900;
  return window.matchMedia(`(pointer: coarse) and (max-width: ${maxWidth}px)`).matches;
}
