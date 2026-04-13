import { useMemo } from "react";
import type { RoomState } from "../types/room";

export interface RoomDerivedState {
  isLobby: boolean;
  isStarted: boolean;
  readyCount: number;
  emptyCount: number;
  canStart: boolean;
}

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

    return { isLobby, isStarted, readyCount, emptyCount, canStart };
  }, [roomState]);
}
