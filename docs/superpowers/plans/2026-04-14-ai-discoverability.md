# AI Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JSDoc annotations and an `llms.txt` file so AI coding assistants can quickly understand the react-gameroom API.

**Architecture:** JSDoc goes directly on existing exports in 4 source files. `llms.txt` is a new standalone file at the project root. README and docs get a one-liner each pointing to `llms.txt`.

**Tech Stack:** TypeScript, JSDoc, Markdown

---

### Task 1: JSDoc on types (`src/types/room.ts`)

**Files:**
- Modify: `src/types/room.ts`

- [ ] **Step 1: Add JSDoc to all types and interfaces**

```ts
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
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — no type errors

- [ ] **Step 3: Commit**

```bash
git add src/types/room.ts
git commit -m "docs: add JSDoc to room types for AI discoverability"
```

---

### Task 2: JSDoc on helpers (`src/helpers/roomHelpers.ts`)

**Files:**
- Modify: `src/helpers/roomHelpers.ts`

- [ ] **Step 1: Add JSDoc to all exported functions**

Add JSDoc above each function. The function bodies stay unchanged.

`createInitialRoom`:
```ts
/**
 * Creates a new room with all player slots set to "empty".
 * @param config - Room configuration (min/max players, requireFull).
 * @returns A fresh RoomState with a generated roomId and "lobby" status.
 * @throws If config has invalid player counts (min < 1, max < 1, or min > max).
 * @example
 * const room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });
 * // room.players.length === 4, all status "empty"
 */
```

`setPlayerJoining`:
```ts
/**
 * Transitions a player slot from "empty" to "joining".
 * No-op if the slot is not empty or does not exist.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @param name - Optional display name for the player.
 * @param data - Optional game-specific data to attach to the slot.
 * @returns New RoomState with the updated slot.
 */
```

`setPlayerReady`:
```ts
/**
 * Transitions a player slot from "joining" to "ready".
 * No-op if the slot is not in "joining" status.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @returns New RoomState with the updated slot.
 */
```

`joinPlayer`:
```ts
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
```

`resetPlayer`:
```ts
/**
 * Resets a player slot back to "empty", clearing name and data.
 * No-op if the slot is already empty.
 * @param state - Current room state.
 * @param playerId - 1-based player slot ID.
 * @returns New RoomState with the slot reset.
 */
```

`startGame`:
```ts
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
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/helpers/roomHelpers.ts
git commit -m "docs: add JSDoc to room helpers for AI discoverability"
```

---

### Task 3: JSDoc on utils (`src/utils/roomUtils.ts`)

**Files:**
- Modify: `src/utils/roomUtils.ts`

- [ ] **Step 1: Add JSDoc to all exported functions**

`generateRoomId`:
```ts
/**
 * Generates a random alphanumeric room code.
 * Uses `crypto.getRandomValues` when available, falls back to `Math.random`.
 * @param length - Length of the generated code (default: 5).
 * @returns An uppercase alphanumeric string.
 */
```

`buildRoomUrl`:
```ts
/**
 * Builds a full URL for a room. Prepends `window.location.origin` in browser environments.
 * @param roomId - The room identifier.
 * @param basePath - Optional path prefix (e.g., "/app").
 * @returns URL in the form `{origin}{basePath}/room/{roomId}`.
 */
```

`buildPlayerUrl`:
```ts
/**
 * Builds a full URL for a specific player slot. Prepends `window.location.origin` in browser environments.
 * @param roomId - The room identifier.
 * @param playerId - 1-based player slot ID.
 * @param basePath - Optional path prefix (e.g., "/app").
 * @returns URL in the form `{origin}{basePath}/room/{roomId}/player/{playerId}`.
 */
```

`parseRoomFromUrl`:
```ts
/**
 * Parses a URL to extract room and optional player IDs.
 * Recognizes `/room/{roomId}` and `/room/{roomId}/player/{playerId}` patterns.
 * @param url - The URL to parse (absolute or relative).
 * @returns An object with `roomId` and optional `playerId`, or `null` if the URL doesn't match.
 */
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/roomUtils.ts
git commit -m "docs: add JSDoc to room utils for AI discoverability"
```

---

### Task 4: JSDoc on hook (`src/hooks/useRoomState.ts`)

**Files:**
- Modify: `src/hooks/useRoomState.ts`

- [ ] **Step 1: Add JSDoc to the interface and hook**

On `RoomDerivedState`:
```ts
/** Computed values derived from a RoomState, returned by `useRoomState`. */
export interface RoomDerivedState {
  /** True if room status is "lobby". */
  isLobby: boolean;
  /** True if room status is "started". */
  isStarted: boolean;
  /** Number of players with "ready" status. */
  readyCount: number;
  /** Number of slots with "empty" status. */
  emptyCount: number;
  /** True if the game can be started (lobby + enough ready players). */
  canStart: boolean;
  /** Number of non-empty slots (joining + ready). */
  playerCount: number;
  /** Map of player ID to name, for players that have a name set. */
  playerNames: Record<number, string>;
}
```

On `useRoomState`:
```ts
/**
 * React hook that computes derived state from a RoomState.
 * Memoized — only recomputes when the input state changes.
 * @param roomState - The current room state.
 * @returns Derived values including `canStart`, `readyCount`, `playerCount`, etc.
 * @example
 * const { canStart, readyCount } = useRoomState(roomState);
 * <button disabled={!canStart}>Start ({readyCount} ready)</button>
 */
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRoomState.ts
git commit -m "docs: add JSDoc to useRoomState hook for AI discoverability"
```

---

### Task 5: Create `llms.txt`

**Files:**
- Create: `llms.txt`

- [ ] **Step 1: Write the llms.txt file**

```markdown
# react-gameroom

> A stateless React component library for multiplayer game lobby management. Pure helper functions manage room state transitions (create → join → ready → start). You bring your own state management — the library takes state in and returns new state out.

## Install

npm install react-gameroom

Peer dependencies: react >= 17.0.0, react-dom >= 17.0.0

## Types

type PlayerStatus = "empty" | "joining" | "ready"
type RoomStatus = "lobby" | "started"

interface PlayerSlot<T = unknown> {
  id: number           // 1-based slot index
  status: PlayerStatus
  name?: string        // display name, set via joinPlayer/setPlayerJoining
  data?: T             // game-specific data (role, color, etc.)
}

interface RoomConfig {
  minPlayers: number
  maxPlayers: number
  requireFull: boolean // if true, all slots must be ready to start
}

interface RoomState<T = unknown> {
  roomId: string
  status: RoomStatus
  players: PlayerSlot<T>[] // always length === maxPlayers
  config: RoomConfig
}

interface RoomDerivedState {
  isLobby: boolean
  isStarted: boolean
  readyCount: number
  emptyCount: number
  canStart: boolean
  playerCount: number              // non-empty slots
  playerNames: Record<number, string> // id → name for named players
}

## Helpers

All helpers are pure functions: they take a RoomState and return a new RoomState without mutation.

createInitialRoom(config: RoomConfig): RoomState
  Creates a room with a generated ID and all slots empty.
  Throws if config is invalid (min < 1, max < 1, min > max).

setPlayerJoining(state, playerId, name?, data?): RoomState
  Transitions slot from "empty" → "joining". No-op if slot is not empty.

setPlayerReady(state, playerId): RoomState
  Transitions slot from "joining" → "ready". No-op if slot is not joining.

joinPlayer(state, playerId, name?, data?): RoomState
  Shorthand: setPlayerJoining + setPlayerReady in one call.

resetPlayer(state, playerId): RoomState
  Resets slot to "empty", clearing name and data. No-op if already empty.

startGame(state): RoomState
  Transitions room from "lobby" → "started" if:
  - readyCount >= config.minPlayers
  - If requireFull: readyCount === config.maxPlayers
  No-op if conditions not met or already started.

## Hook

useRoomState(roomState: RoomState): RoomDerivedState
  Memoized React hook. Returns computed fields: canStart, readyCount,
  emptyCount, playerCount, playerNames, isLobby, isStarted.

## Utils

generateRoomId(length?: number): string
  Random alphanumeric code (default 5 chars). Uses crypto.getRandomValues when available.

buildRoomUrl(roomId, basePath?): string
  Returns URL: {origin}{basePath}/room/{roomId}

buildPlayerUrl(roomId, playerId, basePath?): string
  Returns URL: {origin}{basePath}/room/{roomId}/player/{playerId}

parseRoomFromUrl(url): { roomId: string; playerId?: number } | null
  Parses /room/{id} and /room/{id}/player/{n} patterns from a URL.

## Example

import { createInitialRoom, joinPlayer, startGame, useRoomState } from "react-gameroom";

// 1. Create a room (2-4 players, doesn't need to be full)
let room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });

// 2. Players join (slot ID is 1-based)
room = joinPlayer(room, 1, "Alice");
room = joinPlayer(room, 2, "Bob");

// 3. Check if game can start
const { canStart, readyCount } = useRoomState(room);
// canStart === true, readyCount === 2

// 4. Start the game
room = startGame(room);
// room.status === "started"
```

- [ ] **Step 2: Verify line count is under 200**

Run: `wc -l llms.txt`
Expected: under 200 lines

- [ ] **Step 3: Commit**

```bash
git add llms.txt
git commit -m "docs: add llms.txt for AI coding assistant discoverability"
```

---

### Task 6: Update README.md and docs

**Files:**
- Modify: `README.md`
- Modify: `example/src/docs/ApiPage.tsx`

- [ ] **Step 1: Add llms.txt link to README**

In the "Learn More" section of `README.md`, add this line after the Live Demo entry:

```markdown
- **[`llms.txt`](./llms.txt)** — AI-friendly API reference
```

- [ ] **Step 2: Add llms.txt note to ApiPage**

In `example/src/docs/ApiPage.tsx`, after the `<p className="docs-subtitle">` paragraph (line 8), add:

```tsx
<p>
  For AI coding assistants, a machine-readable API summary is available in{" "}
  <a href="https://github.com/raphaelaleixo/react-gameroom/blob/main/llms.txt">
    llms.txt
  </a>.
</p>
```

- [ ] **Step 3: Run typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both PASS

- [ ] **Step 4: Commit**

```bash
git add README.md example/src/docs/ApiPage.tsx
git commit -m "docs: mention llms.txt in README and API docs page"
```
