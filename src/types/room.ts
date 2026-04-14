/** Status of a player slot in the room lobby. */
export type PlayerStatus = "empty" | "joining" | "ready";

/** Status of the room itself. */
export type RoomStatus = "lobby" | "started";

/**
 * A single player slot in the room.
 * Slots are 1-indexed and always exist for every position up to maxPlayers.
 * @typeParam T - Optional game-specific data type carried on each slot.
 */
export interface PlayerSlot<T = unknown> {
  /** 1-based slot index. */
  id: number;
  /** Current status of this slot. */
  status: PlayerStatus;
  /** Optional display name, set via `joinPlayer` or `setPlayerJoining`. */
  name?: string;
  /** Optional game-specific data (role, color, etc.). */
  data?: T;
}

/**
 * Configuration for a room, provided when creating it.
 */
export interface RoomConfig {
  /** Minimum number of ready players required to start the game. */
  minPlayers: number;
  /** Total number of player slots in the room. */
  maxPlayers: number;
  /** If true, all slots must be ready before the game can start. */
  requireFull: boolean;
}

/**
 * The complete state of a game room.
 * All helper functions take and return this type immutably.
 * @typeParam T - Optional game-specific data type carried on each player slot.
 */
export interface RoomState<T = unknown> {
  /** Unique room identifier (alphanumeric, typically 5 chars). */
  roomId: string;
  /** Current room status. */
  status: RoomStatus;
  /** Fixed-length array of player slots (length === config.maxPlayers). */
  players: PlayerSlot<T>[];
  /** Room configuration provided at creation. */
  config: RoomConfig;
}
