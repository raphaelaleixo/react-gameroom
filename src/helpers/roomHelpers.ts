import type { RoomConfig, RoomState } from "../types/room";
import { generateRoomId } from "../utils/roomUtils";

export function createInitialRoom<T = unknown>(config: RoomConfig): RoomState<T> {
  if (config.maxPlayers < 1 || config.minPlayers < 1 || config.minPlayers > config.maxPlayers) {
    throw new Error(
      `Invalid RoomConfig: minPlayers=${config.minPlayers}, maxPlayers=${config.maxPlayers}`
    );
  }

  const players = Array.from({ length: config.maxPlayers }, (_, i) => ({
    id: i + 1,
    status: "empty" as const,
  }));

  return {
    roomId: generateRoomId(),
    status: "lobby",
    players,
    config,
  };
}

export function setPlayerJoining<T>(state: RoomState<T>, playerId: number, name?: string, data?: T): RoomState<T> {
  const slot = state.players.find((p) => p.id === playerId);
  if (!slot || slot.status !== "empty") return state;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId
        ? { ...p, status: "joining" as const, ...(name !== undefined ? { name } : {}), ...(data !== undefined ? { data } : {}) }
        : p
    ),
  };
}

export function setPlayerReady<T>(state: RoomState<T>, playerId: number): RoomState<T> {
  const slot = state.players.find((p) => p.id === playerId);
  if (!slot || slot.status !== "joining") return state;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, status: "ready" as const } : p
    ),
  };
}

export function joinPlayer<T>(state: RoomState<T>, playerId: number, name?: string, data?: T): RoomState<T> {
  return setPlayerReady(setPlayerJoining(state, playerId, name, data), playerId);
}

export function resetPlayer<T>(state: RoomState<T>, playerId: number): RoomState<T> {
  const slot = state.players.find((p) => p.id === playerId);
  if (!slot || slot.status === "empty") return state;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { id: p.id, status: "empty" as const } : p
    ),
  };
}

export function startGame<T>(state: RoomState<T>): RoomState<T> {
  if (state.status !== "lobby") return state;

  const readyCount = state.players.filter((p) => p.status === "ready").length;

  if (readyCount < state.config.minPlayers) return state;
  if (state.config.requireFull && readyCount < state.config.maxPlayers) return state;

  return { ...state, status: "started" };
}
