export type PlayerStatus = "empty" | "joining" | "ready";

export type RoomStatus = "lobby" | "started";

export interface PlayerSlot {
  id: number; // 1-based
  status: PlayerStatus;
  name?: string;
}

export interface RoomConfig {
  minPlayers: number;
  maxPlayers: number;
  requireFull: boolean;
}

export interface RoomState {
  roomId: string;
  status: RoomStatus;
  players: PlayerSlot[]; // Always length === maxPlayers
  config: RoomConfig;
}
