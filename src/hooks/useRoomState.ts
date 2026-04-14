import { useMemo } from "react";
import type { RoomState } from "../types/room";

/** Computed values derived from a RoomState, returned by `useRoomState`. */
export interface RoomDerivedState {
  /** True if room status is "lobby". */
  isLobby: boolean;
  /** True if room status is "started". */
  isStarted: boolean;
  /** Number of players with "ready" status. */
  readyCount: number;
  /** Number of slots with "empty" status. */
  emptyCount: number;
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
export function useRoomState(roomState: RoomState): RoomDerivedState {
  return useMemo(() => {
    const isLobby = roomState.status === "lobby";
    const isStarted = roomState.status === "started";
    const readyCount = roomState.players.filter((p) => p.status === "ready").length;
    const emptyCount = roomState.players.filter((p) => p.status === "empty").length;

    const meetsMin = readyCount >= roomState.config.minPlayers;
    const meetsFull = roomState.config.requireFull
      ? readyCount === roomState.config.maxPlayers
      : true;
    const canStart = isLobby && meetsMin && meetsFull;

    const playerCount = roomState.players.filter((p) => p.status !== "empty").length;

    const playerNames: Record<number, string> = {};
    for (const p of roomState.players) {
      if (p.name) playerNames[p.id] = p.name;
    }

    return { isLobby, isStarted, readyCount, emptyCount, canStart, playerCount, playerNames };
  }, [roomState]);
}
