# Changelog

## 0.8.0

### Breaking
- `PlayerScreen`: removed `onJoin` prop and the default "Join Game" button. Empty slots now render `labels.invalidSlot` (or `renderEmpty()` when provided). Route players through a dedicated join page that writes the `joining` status before redirecting to the player URL.
- `PlayerScreen`: removed `labels.joinGame` from `PlayerScreenLabels`.

### Added
- `PlayerScreen`: `renderHeader?: (roomState, slot) => ReactNode` render-prop — renders above every phase body, replacing the default `Room / Player` heading when provided. Eliminates header duplication between `renderStarted` and `renderReady`.

### Changed
- `PlayerScreen`: the default heading now uses `slot.name ?? "Player N"` uniformly across all phases (previously only the `started` branch used `slot.name`).

## 0.1.0

Initial release.

### Components
- `Lobby` — host/broadcast view with QR code and player slots
- `PlayerScreen` — individual player view with join/ready flow
- `PlayerSlotsGrid` — CSS Grid layout of player slot cards
- `PlayerSlotView` — single player slot card
- `RoomQRCode` — QR code linking to room URL
- `JoinGame` — room code entry form
- `RoomInfoModal` — modal overlay with QR code and player join URLs

### Hook
- `useRoomState` — derives `canStart`, `readyCount`, `emptyCount`, `isLobby`, `isStarted` from room state

### Helpers
- `createInitialRoom` — creates a room with generated ID and empty slots
- `setPlayerJoining` — transitions slot from empty to joining
- `setPlayerReady` — transitions slot from joining to ready
- `joinPlayer` — shorthand for joining + ready
- `resetPlayer` — resets slot back to empty
- `startGame` — transitions room to started

### Utils
- `generateRoomId` — random alphanumeric room code
- `buildRoomUrl` — full URL for room
- `buildPlayerUrl` — full URL for player slot
- `parseRoomFromUrl` — parses room ID and player ID from URL
