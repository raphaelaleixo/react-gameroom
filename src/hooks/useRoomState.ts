import { useMemo } from "react";
import type { PlayerSlot, RoomState } from "../types/room";

/** Computed values derived from a RoomState, returned by `useRoomState`. */
export interface RoomDerivedState<T = unknown> {
  /** True if room status is "lobby". */
  isLobby: boolean;
  /** True if room status is "started". */
  isStarted: boolean;
  /** Players with "ready" status. */
  readyPlayers: PlayerSlot<T>[];
  /** Number of players with "ready" status. */
  readyCount: number;
  /** Slots with "empty" status. */
  emptySlots: PlayerSlot<T>[];
  /** Number of slots with "empty" status. */
  emptyCount: number;
  /** Non-empty slots (joining + ready). */
  activePlayers: PlayerSlot<T>[];
  /** True if the game can be started (lobby + enough ready players). */
  canStart: boolean;
  /** Number of non-empty slots (joining + ready). */
  playerCount: number;
  /** Map of player ID to name, for players that have a name set. */
  playerNames: Record<number, string>;
}

/**
 * React hook that computes derived state from a RoomState.
 * Memoized — only recomputes when the input state changes.
 * @param roomState - The current room state.
 * @returns Derived values including `canStart`, `readyCount`, `playerCount`, etc.
 * @example
 * const { canStart, readyCount } = useRoomState(roomState);
 * <button disabled={!canStart}>Start ({readyCount} ready)</button>
 */
export function useRoomState<T = unknown>(roomState: RoomState<T>): RoomDerivedState<T> {
  return useMemo(() => {
    const isLobby = roomState.status === "lobby";
    const isStarted = roomState.status === "started";
    const readyPlayers = roomState.players.filter((p) => p.status === "ready");
    const emptySlots = roomState.players.filter((p) => p.status === "empty");
    const activePlayers = roomState.players.filter((p) => p.status !== "empty");

    const readyCount = readyPlayers.length;
    const emptyCount = emptySlots.length;
    const playerCount = activePlayers.length;

    const meetsMin = readyCount >= roomState.config.minPlayers;
    const meetsFull = roomState.config.requireFull
      ? readyCount === roomState.config.maxPlayers
      : true;
    const canStart = isLobby && meetsMin && meetsFull;

    const playerNames: Record<number, string> = {};
    for (const p of roomState.players) {
      if (p.name) playerNames[p.id] = p.name;
    }

    return { isLobby, isStarted, readyPlayers, readyCount, emptySlots, emptyCount, activePlayers, canStart, playerCount, playerNames };
  }, [roomState]);
}
