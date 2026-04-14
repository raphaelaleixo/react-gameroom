import React from "react";
import type { PlayerSlot } from "../types/room";

/**
 * Customizable labels for player slot status text and action buttons.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface PlayerSlotLabels {
  /** Text shown for empty slots with no join action (default: "Empty"). */
  empty?: string;
  /** Text shown while a player is joining (default: "Joining..."). */
  joining?: string;
  /** Text shown when a player is ready (default: "Ready"). */
  ready?: string;
  /** Label for the join button/link (default: "Join"). */
  join?: string;
  /** Label for the ready-up button (default: "Ready"). */
  readyAction?: string;
}

const defaultLabels: Required<PlayerSlotLabels> = {
  empty: "Empty",
  joining: "Joining...",
  ready: "Ready",
  join: "Join",
  readyAction: "Ready",
};

export interface PlayerSlotViewProps {
  slot: PlayerSlot;
  onJoin?: () => void;
  onReady?: () => void;
  href?: string;
  className?: string;
  /** Custom labels for status text and action buttons. */
  labels?: PlayerSlotLabels;
}

export function PlayerSlotView({ slot, onJoin, onReady, href, className, labels: labelsProp }: PlayerSlotViewProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const isLink = href != null;
  const Tag = isLink ? "a" : "div";

  return (
    <Tag
      className={className}
      data-status={slot.status}
      aria-label={slot.name || `Player ${slot.id}`}
      {...(isLink ? { href } : {})}
    >
      <div>
        {slot.name || `Player ${slot.id}`}
      </div>

      {slot.status === "empty" && (
        href != null ? (
          <div>{labels.join}</div>
        ) : onJoin ? (
          <button type="button" onClick={onJoin} aria-label={`Join as ${slot.name || `Player ${slot.id}`}`}>
            {labels.join}
          </button>
        ) : (
          <div role="status" aria-live="polite">{labels.empty}</div>
        )
      )}

      {slot.status === "joining" && (
        href != null ? (
          <div role="status" aria-live="polite">{labels.joining}</div>
        ) : (
          <>
            <div role="status" aria-live="polite">{labels.joining}</div>
            {onReady && (
              <button type="button" onClick={onReady} aria-label={`Mark ${slot.name || `Player ${slot.id}`} as ready`}>
                {labels.readyAction}
              </button>
            )}
          </>
        )
      )}

      {slot.status === "ready" && (
        <div role="status" aria-live="polite">{labels.ready}</div>
      )}
    </Tag>
  );
}
