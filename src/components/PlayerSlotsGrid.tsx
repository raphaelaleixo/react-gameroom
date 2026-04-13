import React from "react";
import type { PlayerSlot } from "../types/room";
import { PlayerSlotView } from "./PlayerSlotView";

export interface PlayerSlotsGridProps {
  players: PlayerSlot[];
  onJoin?: (playerId: number) => void;
  onReady?: (playerId: number) => void;
  className?: string;
}

export function PlayerSlotsGrid({ players, onJoin, onReady, className }: PlayerSlotsGridProps) {
  return (
    <div
      className={className}
      role="list"
      aria-label="Player slots"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 12,
      }}
    >
      {players.map((slot) => (
        <div key={slot.id} role="listitem">
          <PlayerSlotView
            slot={slot}
            onJoin={onJoin ? () => onJoin(slot.id) : undefined}
            onReady={onReady ? () => onReady(slot.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
