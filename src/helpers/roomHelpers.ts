import type { PlayerSlot, RoomConfig, RoomState } from "../types/room";
import { generateRoomId } from "../utils/roomUtils";

/**
 * Creates a new room with all player slots set to "empty".
 * @param config - Room configuration (min/max players, requireFull).
 * @returns A fresh RoomState with a generated roomId and "lobby" status.
 * @throws If config has invalid player counts (min < 1, max < 1, or min > max).
 * @example
 * const room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });
 * // room.players.length === 4, all status "empty"
 */
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

/**
 * Transitions a player slot from "empty" to "joining".
 * No-op if the slot is not empty or does not exist.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @param name - Optional display name for the player.
 * @param data - Optional game-specific data to attach to the slot.
 * @returns New RoomState with the updated slot.
 */
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

/**
 * Transitions a player slot from "joining" to "ready".
 * No-op if the slot is not in "joining" status.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @returns New RoomState with the updated slot.
 */
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

/**
 * Shorthand that transitions a slot from "empty" to "ready" in one call.
 * Equivalent to calling `setPlayerJoining` then `setPlayerReady`.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @param name - Optional display name for the player.
 * @param data - Optional game-specific data to attach to the slot.
 * @returns New RoomState with the player joined and ready.
 * @example
 * let room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });
 * room = joinPlayer(room, 1, "Alice");
 * // room.players[0].status === "ready", room.players[0].name === "Alice"
 */
export function joinPlayer<T>(state: RoomState<T>, playerId: number, name?: string, data?: T): RoomState<T> {
  return setPlayerReady(setPlayerJoining(state, playerId, name, data), playerId);
}

/**
 * Resets a player slot back to "empty", clearing name and data.
 * No-op if the slot is already empty.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @returns New RoomState with the slot reset.
 */
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

/**
 * Transitions the room from "lobby" to "started" if readiness conditions are met.
 * Requires at least `config.minPlayers` ready. If `config.requireFull` is true,
 * all slots must be ready. No-op if conditions are not met or room is already started.
 * @param state - Current room state.
 * @returns New RoomState with status "started", or the same state if conditions aren't met.
 * @example
 * let room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });
 * room = joinPlayer(room, 1, "Alice");
 * room = joinPlayer(room, 2, "Bob");
 * room = startGame(room);
 * // room.status === "started"
 */
/**
 * Finds the first player slot with "empty" status.
 * Useful for first-come-first-served lobbies where players are auto-assigned seats.
 * @param players - The players array from a RoomState.
 * @returns The first empty PlayerSlot, or null if all slots are occupied.
 */
export function findFirstEmptySlot<T>(players: PlayerSlot<T>[]): PlayerSlot<T> | null {
  return players.find((p) => p.status === "empty") ?? null;
}

export function startGame<T>(state: RoomState<T>): RoomState<T> {
  if (state.status !== "lobby") return state;

  const readyCount = state.players.filter((p) => p.status === "ready").length;

  if (readyCount < state.config.minPlayers) return state;
  if (state.config.requireFull && readyCount < state.config.maxPlayers) return state;

  return { ...state, status: "started" };
}

/**
 * Deserializes a raw object (e.g., from a Firebase snapshot) into a proper RoomState.
 * Firebase stores arrays as objects with numeric keys — this function normalizes
 * the `players` field back into a real array.
 * @param raw - A plain object with roomId, status, players, and config fields.
 * @returns A valid RoomState with a properly typed players array.
 */
export function deserializeRoom<T = unknown>(raw: Record<string, unknown>): RoomState<T> {
  const players = raw.players;
  let parsedPlayers: PlayerSlot<T>[];

  if (Array.isArray(players)) {
    parsedPlayers = players;
  } else if (players && typeof players === "object") {
    parsedPlayers = Object.values(players as Record<string, PlayerSlot<T>>);
  } else {
    parsedPlayers = [];
  }

  return {
    roomId: raw.roomId as string,
    status: raw.status as RoomState<T>["status"],
    players: parsedPlayers,
    config: raw.config as RoomConfig,
  };
}
