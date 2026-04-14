# Headless Lobby Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove inline styles from Lobby, PlayerSlotsGrid, and PlayerSlotView so consumers can fully style via CSS, then wire up the example's dark gaming theme.

**Architecture:** Strip inline styles from three library components, add `data-status` attributes for CSS targeting, add className passthrough props from Lobby down to slots. Update the example to compose `<Lobby>` inside themed markup and apply existing CSS classes via the new props.

**Tech Stack:** React, TypeScript, CSS

---

### Task 1: Make PlayerSlotView headless

**Files:**
- Modify: `src/components/PlayerSlotView.tsx`

- [ ] **Step 1: Remove inline styles and add data-status attribute**

Replace the full component body with styles removed and `data-status` added:

```tsx
import React from "react";
import type { PlayerSlot } from "../types/room";

export interface PlayerSlotViewProps {
  slot: PlayerSlot;
  onJoin?: () => void;
  onReady?: () => void;
  className?: string;
}

export function PlayerSlotView({ slot, onJoin, onReady, className }: PlayerSlotViewProps) {
  return (
    <div
      className={className}
      data-status={slot.status}
      aria-label={`Player ${slot.id}`}
    >
      <div>
        Player {slot.id}
      </div>

      {slot.status === "empty" && (
        <button type="button" onClick={onJoin} aria-label={`Join as Player ${slot.id}`}>
          Join
        </button>
      )}

      {slot.status === "joining" && (
        <>
          <div role="status" aria-live="polite">Joining...</div>
          <button type="button" onClick={onReady} aria-label={`Mark Player ${slot.id} as ready`}>
            Ready
          </button>
        </>
      )}

      {slot.status === "ready" && (
        <div role="status" aria-live="polite">Ready</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify library builds and typechecks**

Run: `npm run typecheck && npm run build`
Expected: Both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerSlotView.tsx
git commit -m "refactor: remove inline styles from PlayerSlotView, add data-status attribute"
```

---

### Task 2: Make PlayerSlotsGrid headless with slotClassName passthrough

**Files:**
- Modify: `src/components/PlayerSlotsGrid.tsx`

- [ ] **Step 1: Remove inline styles and add slotClassName prop**

Replace the full component body:

```tsx
import React from "react";
import type { PlayerSlot } from "../types/room";
import { PlayerSlotView } from "./PlayerSlotView";

export interface PlayerSlotsGridProps {
  players: PlayerSlot[];
  onJoin?: (playerId: number) => void;
  onReady?: (playerId: number) => void;
  className?: string;
  slotClassName?: string;
}

export function PlayerSlotsGrid({ players, onJoin, onReady, className, slotClassName }: PlayerSlotsGridProps) {
  return (
    <div
      className={className}
      role="list"
      aria-label="Player slots"
    >
      {players.map((slot) => (
        <div key={slot.id} role="listitem">
          <PlayerSlotView
            slot={slot}
            className={slotClassName}
            onJoin={onJoin ? () => onJoin(slot.id) : undefined}
            onReady={onReady ? () => onReady(slot.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify library builds and typechecks**

Run: `npm run typecheck && npm run build`
Expected: Both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerSlotsGrid.tsx
git commit -m "refactor: remove inline styles from PlayerSlotsGrid, add slotClassName prop"
```

---

### Task 3: Make Lobby headless with className passthrough props

**Files:**
- Modify: `src/components/Lobby.tsx`

- [ ] **Step 1: Remove inline styles and add className passthrough props**

Replace the full component body:

```tsx
import React from "react";
import type { RoomState } from "../types/room";
import { useRoomState } from "../hooks/useRoomState";
import { PlayerSlotsGrid } from "./PlayerSlotsGrid";
import { RoomQRCode } from "./RoomQRCode";

export interface LobbyProps {
  roomState: RoomState;
  onJoin: (playerId: number) => void;
  onReady: (playerId: number) => void;
  onStart: () => void;
  className?: string;
  gridClassName?: string;
  slotClassName?: string;
  buttonClassName?: string;
}

export function Lobby({
  roomState,
  onJoin,
  onReady,
  onStart,
  className,
  gridClassName,
  slotClassName,
  buttonClassName,
}: LobbyProps) {
  const { canStart, readyCount } = useRoomState(roomState);

  return (
    <div className={className}>
      <h2>Room: {roomState.roomId}</h2>

      <div>
        <RoomQRCode roomId={roomState.roomId} />
      </div>

      <div role="status" aria-live="polite">
        {readyCount} / {roomState.config.maxPlayers} players ready
        {!roomState.config.requireFull && ` (min ${roomState.config.minPlayers})`}
      </div>

      <PlayerSlotsGrid
        players={roomState.players}
        className={gridClassName}
        slotClassName={slotClassName}
        onJoin={onJoin}
        onReady={onReady}
      />

      <div>
        <button
          type="button"
          className={buttonClassName}
          onClick={onStart}
          disabled={!canStart}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify library builds and typechecks**

Run: `npm run typecheck && npm run build`
Expected: Both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Lobby.tsx
git commit -m "refactor: remove inline styles from Lobby, add gridClassName/slotClassName/buttonClassName props"
```

---

### Task 4: Update example LobbyPage to use themed Lobby

**Files:**
- Modify: `example/src/pages/LobbyPage.tsx`

- [ ] **Step 1: Update imports and lobby section**

Add `RoomQRCode` back to imports (needed for the themed wrapper):

```tsx
import {
  setPlayerReady,
  startGame,
  Lobby,
  RoomQRCode,
  RoomInfoModal,
  buildPlayerUrl,
} from "react-gameroom";
```

Replace the lobby return section (the `// Lobby` comment and its return block) with a themed wrapper containing the heading, room badge, and QR code, followed by `<Lobby>` with `className="lobby-inner"` to hide its built-in heading/QR/ready-count (the wrapper provides themed versions):

```tsx
  // Lobby
  return (
    <div className="page-top">
      <div className="lobby-header">
        <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 700 }}>Waiting for Players</h2>
        <div className="room-badge">{roomState.roomId}</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="qr-wrapper">
          <RoomQRCode roomId={roomState.roomId} size={160} />
        </div>
      </div>

      <Lobby
        roomState={roomState}
        className="lobby-inner"
        gridClassName="lobby-grid"
        slotClassName="slot"
        buttonClassName="btn"
        onJoin={(playerId) => {
          window.location.href = buildPlayerUrl(roomState.roomId, playerId);
        }}
        onReady={(playerId) => updateRoom(setPlayerReady(roomState, playerId))}
        onStart={() => updateRoom(startGame(roomState))}
      />
    </div>
  );
```

- [ ] **Step 2: Verify example builds**

Run: `cd example && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add example/src/pages/LobbyPage.tsx
git commit -m "feat(example): use Lobby component with themed wrapper and className props"
```

---

### Task 5: Update example CSS for data-status selectors and lobby-inner hiding

**Files:**
- Modify: `example/src/styles.css`

- [ ] **Step 1: Replace slot CSS rules**

Replace the entire "Player slots" section (lines 176-237, from `/* ---- Player slots */` through `.slot-status-ready`) with data-attribute selectors and child-element theming:

```css
/* ---- Player slots ---- */

.slot {
  background: var(--bg-surface);
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-width: 140px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.slot:hover:not([data-status="ready"]) {
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
  transform: translateY(-2px);
}

.slot:active:not([data-status="ready"]) {
  transform: translateY(0);
  box-shadow: 0 0 6px var(--accent-glow);
  background: rgba(233, 69, 96, 0.08);
}

.slot[data-status="joining"] {
  border-style: solid;
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.slot[data-status="ready"] {
  border-style: solid;
  border-color: var(--accent);
  cursor: default;
  opacity: 0.7;
}

.slot > div:first-child {
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.slot[data-status="ready"] > [role="status"] {
  color: var(--accent);
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.slot[data-status="joining"] > [role="status"] {
  color: var(--accent);
  font-size: 14px;
}

.slot button {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.slot button:hover {
  background: rgba(233, 69, 96, 0.15);
}
```

- [ ] **Step 2: Add lobby-inner styles**

Add CSS after the "Lobby layout" section to hide Lobby's built-in heading, QR code, and ready count (the themed wrapper provides its own). Uses `:has(svg)` to target the QR wrapper div:

```css
/* ---- Lobby inner (hides Lobby built-ins, themed wrapper provides its own) ---- */

.lobby-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lobby-inner > h2,
.lobby-inner > div:has(svg),
.lobby-inner > [role="status"] {
  display: none;
}
```

- [ ] **Step 3: Add lobby-ready-count as themed replacement**

Add this style for the ready count shown by the wrapper. Keep the existing `.lobby-ready-count` rule — it's still used. No changes needed since the wrapper doesn't render its own ready count (Lobby's is hidden, we'll rely on the grid showing status per slot).

Actually, the ready count is useful. Add it to the wrapper in LobbyPage instead of hiding it. But since we already committed LobbyPage in Task 4 without it, we'll add it here.

Wait — let's keep it simple. The ready count from Lobby is hidden. The slot statuses visible in the grid are sufficient. No additional changes needed.

- [ ] **Step 4: Verify example builds**

Run: `cd example && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add example/src/styles.css
git commit -m "feat(example): update CSS to use data-status selectors and lobby-inner hiding"
```

---

### Task 6: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update Lobby component docs (lines 120-131)**

Replace:

```markdown
#### `<Lobby>`

The host/broadcast view. Displays the room code, a QR code for players to scan, a grid of player slots, and a "Start Game" button.

```tsx
<Lobby
  roomState={roomState}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
  onStart={() => {}}
/>
```
```

With:

```markdown
#### `<Lobby>`

The host/broadcast view. Displays the room code, a QR code for players to scan, a grid of player slots, and a "Start Game" button. Ships with no inline styles — all visual presentation is controlled by the consumer via `className` props.

```tsx
<Lobby
  roomState={roomState}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
  onStart={() => {}}
  className="my-lobby"
  gridClassName="my-grid"
  slotClassName="my-slot"
  buttonClassName="my-btn"
/>
```
```

- [ ] **Step 2: Update PlayerSlotsGrid docs (lines 146-156)**

Replace:

```markdown
#### `<PlayerSlotsGrid>`

A CSS Grid layout of player slot cards. Used internally by `Lobby` but available for custom layouts.

```tsx
<PlayerSlotsGrid
  players={roomState.players}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
/>
```
```

With:

```markdown
#### `<PlayerSlotsGrid>`

A layout wrapper for player slot cards. Used internally by `Lobby` but available for custom layouts. Accepts `slotClassName` to forward a class to each `PlayerSlotView`.

```tsx
<PlayerSlotsGrid
  players={roomState.players}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
  slotClassName="my-slot"
/>
```
```

- [ ] **Step 3: Update PlayerSlotView docs (lines 158-168)**

Replace:

```markdown
#### `<PlayerSlotView>`

A single player slot card showing the current status with appropriate action buttons.

```tsx
<PlayerSlotView
  slot={roomState.players[0]}
  onJoin={() => {}}
  onReady={() => {}}
/>
```
```

With:

```markdown
#### `<PlayerSlotView>`

A single player slot showing the current status with appropriate action buttons. Exposes `data-status` (`"empty"`, `"joining"`, `"ready"`) on its wrapper element for CSS targeting.

```tsx
<PlayerSlotView
  slot={roomState.players[0]}
  onJoin={() => {}}
  onReady={() => {}}
  className="my-slot"
/>
```

Style by status with attribute selectors:

```css
.my-slot[data-status="ready"] { border-color: green; }
.my-slot[data-status="joining"] { border-color: orange; }
```
```

- [ ] **Step 4: Update Accessibility section (line 461)**

Replace:

```
Components use inline styles for layout but do not override focus outlines, so browser-default focus indicators remain visible. Since the library is headless in terms of theming (consumers apply styles via `className`), color contrast is ultimately the consumer's responsibility.
```

With:

```
Components ship with no inline styles, giving consumers full control over theming via `className` props. Browser-default focus indicators remain visible. Since the library is headless (consumers apply styles via `className`), color contrast is the consumer's responsibility.
```

- [ ] **Step 5: Update LobbyPage example code block (lines 345-351)**

Replace:

```tsx
<Lobby
  roomState={roomState}
  onJoin={(playerId) => navigate(`/room/${roomId}/player/${playerId}`)}
  onReady={(playerId) => updateRoom(setPlayerReady(roomState, playerId))}
  onStart={() => updateRoom(startGame(roomState))}
/>
```

With:

```tsx
<Lobby
  roomState={roomState}
  className="lobby-inner"
  gridClassName="lobby-grid"
  slotClassName="slot"
  buttonClassName="btn"
  onJoin={(playerId) => {
    window.location.href = buildPlayerUrl(roomState.roomId, playerId);
  }}
  onReady={(playerId) => updateRoom(setPlayerReady(roomState, playerId))}
  onStart={() => updateRoom(startGame(roomState))}
/>
```

- [ ] **Step 6: Verify everything builds**

Run: `npm run typecheck && npm run build && cd example && npm run build`
Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "docs: update component API docs for headless styling props and data-status attribute"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full build check**

Run: `npm run typecheck && npm run build && cd example && npm run build`
Expected: All three commands succeed with no errors or warnings.

- [ ] **Step 2: Visual check**

Run: `cd example && npm run dev -- --host`
Open the dev server URL in a browser, create a game, and verify:
- The lobby page shows "Waiting for Players" heading with a room badge
- QR code is displayed in a white wrapper
- Player slots have the dark theme (dark background, dashed borders, accent colors)
- Empty slots are clickable with hover effects
- The Start Game button uses the accent-colored `.btn` style
- The button is disabled until enough players are ready
