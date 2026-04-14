import React from "react";
import type { PlayerSlot } from "../types/room";
import { PlayerSlotView } from "./PlayerSlotView";
import type { PlayerSlotLabels } from "./PlayerSlotView";

export interface PlayerSlotsGridProps {
  players: PlayerSlot[];
  onJoin?: (playerId: number) => void;
  onReady?: (playerId: number) => void;
  buildSlotHref?: (playerId: number) => string;
  className?: string;
  slotClassName?: string;
  /** Custom labels forwarded to each PlayerSlotView. */
  labels?: PlayerSlotLabels;
}

export function PlayerSlotsGrid({ players, onJoin, onReady, buildSlotHref, className, slotClassName, labels }: PlayerSlotsGridProps) {
  return (
    <div
      className={className}
      role="list"
      aria-label="Player slots"
    >
      {players.map((slot) => (
        <div key={slot.id} role="listitem">
          <PlayerSlotView
            slot={slot}
            className={slotClassName}
            href={buildSlotHref ? buildSlotHref(slot.id) : undefined}
            onJoin={onJoin ? () => onJoin(slot.id) : undefined}
            onReady={onReady ? () => onReady(slot.id) : undefined}
            labels={labels}
          />
        </div>
      ))}
    </div>
  );
}
