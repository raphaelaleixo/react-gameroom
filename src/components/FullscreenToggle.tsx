import React from "react";
import { useFullscreen } from "../hooks/useFullscreen";

/**
 * Customizable labels for FullscreenToggle text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface FullscreenToggleLabels {
  /** Button text when not fullscreen (default: "Fullscreen"). */
  enter?: string;
  /** Button text when fullscreen (default: "Exit fullscreen"). */
  exit?: string;
}

const defaultLabels: Required<FullscreenToggleLabels> = {
  enter: "Fullscreen",
  exit: "Exit fullscreen",
};

export interface FullscreenToggleProps {
  /** CSS class applied to the button element. */
  className?: string;
  /** Customizable button text for i18n. */
  labels?: FullscreenToggleLabels;
  /**
   * When true (default), the component renders nothing on platforms without
   * the Fullscreen API (e.g. iPhone Safari). Set false to keep the button
   * mounted as a disabled placeholder for layout consistency.
   */
  hideWhenUnsupported?: boolean;
}

/**
 * A button that toggles page fullscreen via the Fullscreen API.
 * Built on `useFullscreen`. Hidden by default when the API is unavailable.
 * @example
 * <FullscreenToggle className="btn" />
 */
export function FullscreenToggle({
  className,
  labels: labelsProp,
  hideWhenUnsupported = true,
}: FullscreenToggleProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const { isFullscreen, isSupported, toggle } = useFullscreen();

  if (!isSupported && hideWhenUnsupported) return null;

  return (
    <button
      type="button"
      className={className}
      disabled={!isSupported}
      aria-pressed={isFullscreen}
      onClick={toggle}
    >
      {isFullscreen ? labels.exit : labels.enter}
    </button>
  );
}
