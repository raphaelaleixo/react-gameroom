import React from "react";
import type { PlayerSlot } from "../types/room";
import { PlayerSlotView } from "./PlayerSlotView";

export interface PlayerSlotsGridProps {
  players: PlayerSlot[];
  onJoin?: (playerId: number) => void;
  onReady?: (playerId: number) => void;
  className?: string;
  slotClassName?: string;
}

export function PlayerSlotsGrid({ players, onJoin, onReady, className, slotClassName }: PlayerSlotsGridProps) {
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
            onJoin={onJoin ? () => onJoin(slot.id) : undefined}
            onReady={onReady ? () => onReady(slot.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
