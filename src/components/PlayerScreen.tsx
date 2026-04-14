import React from "react";
import type { RoomState } from "../types/room";

export interface PlayerScreenProps {
  roomState: RoomState;
  playerId: number;
  onJoin?: () => void;
  onReady?: () => void;
  renderStarted?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderReady?: () => React.ReactNode;
  className?: string;
}

export function PlayerScreen({
  roomState,
  playerId,
  onJoin,
  onReady,
  renderStarted,
  renderEmpty,
  renderReady,
  className,
}: PlayerScreenProps) {
  const slot = roomState.players.find((p) => p.id === playerId);

  if (!slot) {
    return <div className={className} role="alert">Invalid player slot</div>;
  }

  if (roomState.status === "started") {
    return (
      <div className={className}>
        {renderStarted ? renderStarted() : (
          <>
            <h2>Room: {roomState.roomId}</h2>
            <h3>{slot.name || `Player ${playerId}`}</h3>
            <div role="status" aria-live="polite">Game Started!</div>
          </>
        )}
      </div>
    );
  }

  const hasCustomLobby = renderEmpty != null || renderReady != null;

  return (
    <div className={className}>
      {!hasCustomLobby && (
        <>
          <h2>Room: {roomState.roomId}</h2>
          <h3>Player {playerId}</h3>
        </>
      )}

      {slot.status === "empty" && (
        renderEmpty ? renderEmpty() : (
          <button type="button" onClick={onJoin}>
            Join Game
          </button>
        )
      )}

      {slot.status === "joining" && (
        <div>
          <div role="status" aria-live="polite">Joining...</div>
          <button type="button" onClick={onReady}>
            Ready Up
          </button>
        </div>
      )}

      {slot.status === "ready" && (
        renderReady ? renderReady() : (
          <div role="status" aria-live="polite">
            Ready! Waiting for others...
          </div>
        )
      )}
    </div>
  );
}
