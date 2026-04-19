// Types
export type {
  PlayerStatus,
  RoomStatus,
  PlayerSlot,
  RoomConfig,
  RoomState,
} from "./types/room";

// Helpers
export {
  createInitialRoom,
  setPlayerJoining,
  setPlayerReady,
  joinPlayer,
  findFirstEmptySlot,
  resetPlayer,
  startGame,
  deserializeRoom,
} from "./helpers/roomHelpers";

// Hooks
export { useRoomState } from "./hooks/useRoomState";
export type { RoomDerivedState } from "./hooks/useRoomState";

// Components
export { PlayerSlotView } from "./components/PlayerSlotView";
export type { PlayerSlotViewProps, PlayerSlotLabels } from "./components/PlayerSlotView";

export { PlayerSlotsGrid } from "./components/PlayerSlotsGrid";
export type { PlayerSlotsGridProps } from "./components/PlayerSlotsGrid";


export { PlayerScreen } from "./components/PlayerScreen";
export type { PlayerScreenProps, PlayerScreenLabels } from "./components/PlayerScreen";

export { RoomQRCode } from "./components/RoomQRCode";
export type { RoomQRCodeProps } from "./components/RoomQRCode";

export { StartGameButton } from "./components/StartGameButton";
export type { StartGameButtonProps, StartGameButtonLabels } from "./components/StartGameButton";

export { JoinGame } from "./components/JoinGame";
export type { JoinGameProps, JoinGameLabels } from "./components/JoinGame";

export { RoomInfoModal } from "./components/RoomInfoModal";
export type { RoomInfoModalProps, RoomInfoModalLabels } from "./components/RoomInfoModal";

export { HostDeviceWarningModal } from "./components/HostDeviceWarningModal";
export type {
  HostDeviceWarningModalProps,
  HostDeviceWarningModalLabels,
} from "./components/HostDeviceWarningModal";

// Utils
export {
  generateRoomId,
  buildRoomUrl,
  buildPlayerUrl,
  buildJoinUrl,
  buildRejoinUrl,
  parseRoomFromUrl,
} from "./utils/roomUtils";

export { isLikelyMobileHost } from "./utils/isLikelyMobileHost";
