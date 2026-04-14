import React from "react";
import type { PlayerSlot } from "../types/room";

export interface PlayerSlotViewProps {
  slot: PlayerSlot;
  onJoin?: () => void;
  onReady?: () => void;
  className?: string;
}

export function PlayerSlotView({ slot, onJoin, onReady, className }: PlayerSlotViewProps) {
  return (
    <div
      className={className}
      data-status={slot.status}
      aria-label={`Player ${slot.id}`}
    >
      <div>
        Player {slot.id}
      </div>

      {slot.status === "empty" && (
        <button type="button" onClick={onJoin} aria-label={`Join as Player ${slot.id}`}>
          Join
        </button>
      )}

      {slot.status === "joining" && (
        <>
          <div role="status" aria-live="polite">Joining...</div>
          <button type="button" onClick={onReady} aria-label={`Mark Player ${slot.id} as ready`}>
            Ready
          </button>
        </>
      )}

      {slot.status === "ready" && (
        <div role="status" aria-live="polite">Ready</div>
      )}
    </div>
  );
}
