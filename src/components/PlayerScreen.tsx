import React from "react";
import type { RoomState } from "../types/room";

/**
 * Customizable labels for PlayerScreen default UI text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface PlayerScreenLabels {
  /** Error shown when playerId doesn't match any slot (default: "Invalid player slot"). */
  invalidSlot?: string;
  /** Heading prefix before roomId (default: "Room:"). */
  roomHeading?: string;
  /** Heading prefix before playerId (default: "Player"). */
  playerHeading?: string;
  /** Status text when game has started (default: "Game Started!"). */
  gameStarted?: string;
  /** Join button text (default: "Join Game"). */
  joinGame?: string;
  /** Status text while joining (default: "Joining..."). */
  joining?: string;
  /** Ready-up button text (default: "Ready Up"). */
  readyUp?: string;
  /** Status text when ready (default: "Ready! Waiting for others..."). */
  readyWaiting?: string;
}

const defaultLabels: Required<PlayerScreenLabels> = {
  invalidSlot: "Invalid player slot",
  roomHeading: "Room:",
  playerHeading: "Player",
  gameStarted: "Game Started!",
  joinGame: "Join Game",
  joining: "Joining...",
  readyUp: "Ready Up",
  readyWaiting: "Ready! Waiting for others...",
};

export interface PlayerScreenProps {
  roomState: RoomState;
  playerId: number;
  onJoin?: () => void;
  onReady?: () => void;
  renderStarted?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderReady?: () => React.ReactNode;
  className?: string;
  /** Custom labels for default UI text. */
  labels?: PlayerScreenLabels;
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
  labels: labelsProp,
}: PlayerScreenProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const slot = roomState.players.find((p) => p.id === playerId);

  if (!slot) {
    return <div className={className} role="alert">{labels.invalidSlot}</div>;
  }

  if (roomState.status === "started") {
    return (
      <div className={className}>
        {renderStarted ? renderStarted() : (
          <>
            <h2>{labels.roomHeading} {roomState.roomId}</h2>
            <h3>{slot.name || `${labels.playerHeading} ${playerId}`}</h3>
            <div role="status" aria-live="polite">{labels.gameStarted}</div>
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
          <h2>{labels.roomHeading} {roomState.roomId}</h2>
          <h3>{labels.playerHeading} {playerId}</h3>
        </>
      )}

      {slot.status === "empty" && (
        renderEmpty ? renderEmpty() : (
          <button type="button" onClick={onJoin}>
            {labels.joinGame}
          </button>
        )
      )}

      {slot.status === "joining" && (
        <div>
          <div role="status" aria-live="polite">{labels.joining}</div>
          <button type="button" onClick={onReady}>
            {labels.readyUp}
          </button>
        </div>
      )}

      {slot.status === "ready" && (
        renderReady ? renderReady() : (
          <div role="status" aria-live="polite">
            {labels.readyWaiting}
          </div>
        )
      )}
    </div>
  );
}
