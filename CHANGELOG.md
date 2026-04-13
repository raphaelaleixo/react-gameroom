# Changelog

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
