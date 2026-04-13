import React from "react";
import type { RoomState } from "../types/room";

export interface PlayerScreenProps {
  roomState: RoomState;
  playerId: number;
  onJoin: () => void;
  onReady: () => void;
  className?: string;
}

export function PlayerScreen({
  roomState,
  playerId,
  onJoin,
  onReady,
  className,
}: PlayerScreenProps) {
  const slot = roomState.players.find((p) => p.id === playerId);

  if (!slot) {
    return <div className={className}>Invalid player slot</div>;
  }

  return (
    <div className={className} style={{ padding: 24, textAlign: "center" }}>
      <h2>Room: {roomState.roomId}</h2>
      <h3>Player {playerId}</h3>

      {roomState.status === "started" && (
        <div style={{ fontSize: 20, color: "green" }}>Game Started!</div>
      )}

      {roomState.status === "lobby" && (
        <>
          {slot.status === "empty" && (
            <button type="button" onClick={onJoin} style={{ padding: "10px 24px", fontSize: 16 }}>
              Join Game
            </button>
          )}

          {slot.status === "joining" && (
            <div>
              <div style={{ marginBottom: 8 }}>You're joining...</div>
              <button type="button" onClick={onReady} style={{ padding: "10px 24px", fontSize: 16 }}>
                Ready Up
              </button>
            </div>
          )}

          {slot.status === "ready" && (
            <div style={{ fontSize: 20, color: "green", fontWeight: "bold" }}>
              Ready! Waiting for others...
            </div>
          )}
        </>
      )}
    </div>
  );
}
