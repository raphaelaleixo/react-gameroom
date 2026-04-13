import type { RoomConfig, RoomState, PlayerSlot } from "../types/room";
import { generateRoomId } from "../utils/roomUtils";

export function createInitialRoom(config: RoomConfig): RoomState {
  if (config.maxPlayers < 1 || config.minPlayers < 1 || config.minPlayers > config.maxPlayers) {
    throw new Error(
      `Invalid RoomConfig: minPlayers=${config.minPlayers}, maxPlayers=${config.maxPlayers}`
    );
  }

  const players: PlayerSlot[] = Array.from({ length: config.maxPlayers }, (_, i) => ({
    id: i + 1,
    status: "empty",
  }));

  return {
    roomId: generateRoomId(),
    status: "lobby",
    players,
    config,
  };
}

export function setPlayerJoining(state: RoomState, playerId: number): RoomState {
  const slot = state.players.find((p) => p.id === playerId);
  if (!slot || slot.status !== "empty") return state;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, status: "joining" } : p
    ),
  };
}

export function setPlayerReady(state: RoomState, playerId: number): RoomState {
  const slot = state.players.find((p) => p.id === playerId);
  if (!slot || slot.status !== "joining") return state;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, status: "ready" } : p
    ),
  };
}

export function joinPlayer(state: RoomState, playerId: number): RoomState {
  return setPlayerReady(setPlayerJoining(state, playerId), playerId);
}

export function resetPlayer(state: RoomState, playerId: number): RoomState {
  const slot = state.players.find((p) => p.id === playerId);
  if (!slot || slot.status === "empty") return state;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, status: "empty" } : p
    ),
  };
}

export function startGame(state: RoomState): RoomState {
  if (state.status !== "lobby") return state;

  const readyCount = state.players.filter((p) => p.status === "ready").length;

  if (readyCount < state.config.minPlayers) return state;
  if (state.config.requireFull && readyCount < state.config.maxPlayers) return state;

  return { ...state, status: "started" };
}
