import React from "react";
import type { RoomState } from "../types/room";
import { useRoomState } from "../hooks/useRoomState";
import { startGame } from "../helpers/roomHelpers";

/**
 * Customizable labels for StartGameButton text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface StartGameButtonLabels {
  /** Button text (default: "Start Game"). */
  start?: string;
}

const defaultLabels: Required<StartGameButtonLabels> = {
  start: "Start Game",
};

export interface StartGameButtonProps<T = unknown> {
  /** Current room state. */
  roomState: RoomState<T>;
  /** Called with the transitioned RoomState (status: "started") when the button is clicked. */
  onStart: (newState: RoomState<T>) => void;
  /** Customizable button text for i18n. */
  labels?: StartGameButtonLabels;
  /** CSS class applied to the button element. */
  className?: string;
}

/**
 * A button that starts the game when lobby readiness conditions are met.
 * Automatically disables when the game cannot be started.
 * @example
 * <StartGameButton roomState={roomState} onStart={updateRoom} />
 */
export function StartGameButton<T = unknown>({
  roomState,
  onStart,
  labels: labelsProp,
  className,
}: StartGameButtonProps<T>) {
  const labels = { ...defaultLabels, ...labelsProp };
  const { canStart } = useRoomState(roomState);

  return (
    <button
      type="button"
      className={className}
      disabled={!canStart}
      onClick={() => onStart(startGame(roomState))}
    >
      {labels.start}
    </button>
  );
}
