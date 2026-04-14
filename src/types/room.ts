export type PlayerStatus = "empty" | "joining" | "ready";

export type RoomStatus = "lobby" | "started";

export interface PlayerSlot<T = unknown> {
  id: number; // 1-based
  status: PlayerStatus;
  name?: string;
  data?: T;
}

export interface RoomConfig {
  minPlayers: number;
  maxPlayers: number;
  requireFull: boolean;
}

export interface RoomState<T = unknown> {
  roomId: string;
  status: RoomStatus;
  players: PlayerSlot<T>[]; // Always length === maxPlayers
  config: RoomConfig;
}
