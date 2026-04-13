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
}

export function Lobby({ roomState, onJoin, onReady, onStart, className }: LobbyProps) {
  const { canStart, readyCount } = useRoomState(roomState);

  return (
    <div className={className} style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Room: {roomState.roomId}</h2>

      <div style={{ marginBottom: 16 }}>
        <RoomQRCode roomId={roomState.roomId} />
      </div>

      <div role="status" aria-live="polite" style={{ marginBottom: 8, color: "#666" }}>
        {readyCount} / {roomState.config.maxPlayers} players ready
        {!roomState.config.requireFull && ` (min ${roomState.config.minPlayers})`}
      </div>

      <PlayerSlotsGrid
        players={roomState.players}
        onJoin={onJoin}
        onReady={onReady}
      />

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          style={{
            padding: "10px 24px",
            fontSize: 16,
            cursor: canStart ? "pointer" : "not-allowed",
            opacity: canStart ? 1 : 0.5,
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
