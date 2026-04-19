import React from "react";
import type { PlayerSlot, RoomState } from "../types/room";

/**
 * Customizable labels for PlayerScreen default UI text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface PlayerScreenLabels {
  /** Error shown when playerId doesn't match any slot or the slot is empty (default: "Invalid player slot"). */
  invalidSlot?: string;
  /** Heading prefix before roomId (default: "Room:"). */
  roomHeading?: string;
  /** Heading prefix before playerId (default: "Player"). */
  playerHeading?: string;
  /** Status text when game has started (default: "Game Started!"). */
  gameStarted?: string;
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
  joining: "Joining...",
  readyUp: "Ready Up",
  readyWaiting: "Ready! Waiting for others...",
};

export interface PlayerScreenProps {
  roomState: RoomState;
  playerId: number;
  onReady?: () => void;
  renderHeader?: (roomState: RoomState, slot: PlayerSlot) => React.ReactNode;
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
  onReady,
  renderHeader,
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

  const header = renderHeader ? renderHeader(roomState, slot) : (
    <>
      <h2>{labels.roomHeading} {roomState.roomId}</h2>
      <h3>{slot.name || `${labels.playerHeading} ${playerId}`}</h3>
    </>
  );

  let body: React.ReactNode;
  if (roomState.status === "started") {
    body = renderStarted ? renderStarted() : (
      <div role="status" aria-live="polite">{labels.gameStarted}</div>
    );
  } else if (slot.status === "empty") {
    body = renderEmpty ? renderEmpty() : (
      <div role="alert">{labels.invalidSlot}</div>
    );
  } else if (slot.status === "joining") {
    body = (
      <div>
        <div role="status" aria-live="polite">{labels.joining}</div>
        <button type="button" onClick={onReady}>
          {labels.readyUp}
        </button>
      </div>
    );
  } else {
    body = renderReady ? renderReady() : (
      <div role="status" aria-live="polite">{labels.readyWaiting}</div>
    );
  }

  return (
    <div className={className}>
      {header}
      {body}
    </div>
  );
}
