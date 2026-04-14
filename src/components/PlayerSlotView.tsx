import React from "react";
import type { PlayerSlot } from "../types/room";

export interface PlayerSlotViewProps {
  slot: PlayerSlot;
  onJoin?: () => void;
  onReady?: () => void;
  href?: string;
  className?: string;
}

export function PlayerSlotView({ slot, onJoin, onReady, href, className }: PlayerSlotViewProps) {
  const isLink = href != null && slot.status !== "ready";
  const Tag = isLink ? "a" : "div";

  return (
    <Tag
      className={className}
      data-status={slot.status}
      aria-label={`Player ${slot.id}`}
      {...(isLink ? { href } : {})}
    >
      <div>
        Player {slot.id}
      </div>

      {slot.status === "empty" && (
        href != null ? (
          <div>Join</div>
        ) : (
          <button type="button" onClick={onJoin} aria-label={`Join as Player ${slot.id}`}>
            Join
          </button>
        )
      )}

      {slot.status === "joining" && (
        href != null ? (
          <div role="status" aria-live="polite">Joining...</div>
        ) : (
          <>
            <div role="status" aria-live="polite">Joining...</div>
            <button type="button" onClick={onReady} aria-label={`Mark Player ${slot.id} as ready`}>
              Ready
            </button>
          </>
        )
      )}

      {slot.status === "ready" && (
        <div role="status" aria-live="polite">Ready</div>
      )}
    </Tag>
  );
}
