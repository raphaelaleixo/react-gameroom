import React from "react";
import type { RoomState } from "../types/room";
import { useRoomState } from "../hooks/useRoomState";
import { PlayerSlotsGrid } from "./PlayerSlotsGrid";
import { RoomQRCode } from "./RoomQRCode";

export interface LobbyProps {
  roomState: RoomState;
  onJoin: (playerId: number) => void;
  onReady: (playerId: number) => void;
  onStart: () => void;
  className?: string;
  gridClassName?: string;
  slotClassName?: string;
  buttonClassName?: string;
}

export function Lobby({
  roomState,
  onJoin,
  onReady,
  onStart,
  className,
  gridClassName,
  slotClassName,
  buttonClassName,
}: LobbyProps) {
  const { canStart, readyCount } = useRoomState(roomState);

  return (
    <div className={className}>
      <h2>Room: {roomState.roomId}</h2>

      <div>
        <RoomQRCode roomId={roomState.roomId} />
      </div>

      <div role="status" aria-live="polite">
        {readyCount} / {roomState.config.maxPlayers} players ready
        {!roomState.config.requireFull && ` (min ${roomState.config.minPlayers})`}
      </div>

      <PlayerSlotsGrid
        players={roomState.players}
        className={gridClassName}
        slotClassName={slotClassName}
        onJoin={onJoin}
        onReady={onReady}
      />

      <div>
        <button
          type="button"
          className={buttonClassName}
          onClick={onStart}
          disabled={!canStart}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
