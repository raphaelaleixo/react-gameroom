# Changelog

## 0.11.0

### Added
- `PlayerEntryScreen` component — drop-in landing screen for the `/room/{id}/player` route. Renders a name form when the lobby has space (auto-resolves the first empty slot via `findFirstEmptySlot` and hands `(name, slotId)` to `onJoin`), a "lobby full" message when all seats are taken pre-start, or a seat-rejoin link grid for filled slots once the game has started. Each branch is replaceable via `renderForm`, `renderStarted`, and `renderFull` render props; the form's `submit(name)` helper drives the same `isSubmitting` flow when overridden.
- `RoomInfoModal`: optional `qrUrl?` prop — overrides the auto-derived QR URL with a custom value (e.g., a short link or deep link). The link list still uses the derived per-player URLs; only the QR target changes.

## 0.10.0

### Added
- `useFullscreen` hook — wraps the page-level Fullscreen API. Returns `{ isFullscreen, isSupported, toggle }`. Subscribes to `fullscreenchange` so `isFullscreen` stays in sync with ESC and browser-UI exits. SSR-safe; `isSupported` is `false` on platforms without the API (e.g. iPhone Safari).
- `FullscreenToggle` component — drop-in label-only button built on `useFullscreen`. Props: `className`, `labels` (`enter`/`exit` overrides), `hideWhenUnsupported` (default `true`). Includes `aria-pressed` for screen-reader toggle semantics. Returns `null` on unsupported platforms by default.

## 0.9.1

### Added
- `isLikelyMobileHost` now accepts an optional `{ maxWidth }` argument (default 900) to support tablet-host paths without forking the helper.
- `IsLikelyMobileHostOptions` type export.

### Changed
- `HostDeviceWarningModal`: `<dialog>` now has `role="alertdialog"` to signal "warning" semantics to screen readers.

## 0.9.0

### Added
- `HostDeviceWarningModal` component — native `<dialog>`-based confirmation modal for gating "become the host" flows on phones and small tablets. Customizable labels (title, body, confirmLabel, cancelLabel); Escape and backdrop click trigger `onCancel`.
- `isLikelyMobileHost` util — returns `true` when the environment has a coarse pointer AND viewport ≤ 900px. Uses `matchMedia`, SSR-safe. Snapshot, not reactive — intended as a one-shot gate.

## 0.8.0

### Breaking
- `PlayerScreen`: removed `onJoin` prop and the default "Join Game" button. Empty slots now render `labels.invalidSlot` (or `renderEmpty()` when provided). Route players through a dedicated join page that writes the `joining` status before redirecting to the player URL.
- `PlayerScreen`: removed `labels.joinGame` from `PlayerScreenLabels`.

### Added
- `PlayerScreen`: `renderHeader?: (roomState, slot) => ReactNode` render-prop — renders above every phase body, replacing the default `Room / Player` heading when provided. Eliminates header duplication between `renderStarted` and `renderReady`.

### Changed
- `PlayerScreen`: the default heading now uses `slot.name ?? "Player N"` uniformly across all phases (previously only the `started` branch used `slot.name`).

## 0.7.0

### Added
- `StartGameButton` component — internalizes `startGame` + `canStart` logic to eliminate boilerplate.
- `useRoomState` now exposes `readyPlayers`, `emptySlots`, and `activePlayers` arrays alongside the existing counts.

### Changed
- `RoomQRCode` props documented; `findFirstEmptySlot` / `startGame` JSDoc reordered.

## 0.6.0

### Added
- `deserializeRoom` helper — normalizes raw objects (e.g., Firebase snapshots) into proper `RoomState` with real arrays.
- `JoinGame`: `labels` prop for full i18n consistency with other components.

## 0.5.0

### Breaking
- `PlayerSlotView` now renders as `<a>` whenever `href` is set, regardless of slot status (previously skipped `ready` slots).

### Added
- `PlayerSlotsGrid`: `filterEmpty` prop — hides empty slots (useful for rejoin grids).

## 0.4.0

### Added
- `RoomInfoModal` is now status-aware: lobby uses `buildJoinUrl` / "Join", started uses `buildRejoinUrl` / "Rejoin".
- `buildRejoinUrl` util.
- `parseRoomFromUrl`: `isRejoin` flag on parsed results.

## 0.3.0

### Added
- `labels` prop on `PlayerSlotView`, `PlayerSlotsGrid`, `PlayerScreen`, and `RoomInfoModal` — override all hardcoded UI strings.

### Changed
- Empty slots without `onJoin` / `href` now show the "Empty" label instead of a non-functional Join button.

## 0.2.0

### Added
- `findFirstEmptySlot` helper.
- `buildJoinUrl` util.
- `parseRoomFromUrl`: `isJoin` flag on parsed results.

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
