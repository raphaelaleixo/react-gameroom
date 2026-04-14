# react-gameroom

A stateless React component library for multiplayer game lobby management. It handles player slots, room state transitions, QR code generation, and URL routing — you bring your own state management and game logic.

## Install

```bash
npm install react-gameroom
```

Peer dependencies: `react >= 17.0.0` and `react-dom >= 17.0.0`.

## Quick Start

```tsx
import {
  createInitialRoom, joinPlayer, startGame,
  useRoomState, PlayerSlotsGrid, RoomQRCode, buildPlayerUrl,
} from "react-gameroom";

// 1. Create a room
const room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });

// 2. Transition players through the state machine: empty → joining → ready
const updated = joinPlayer(room, 1); // Player 1 joins and is immediately ready

// 3. Start the game when conditions are met
const started = startGame(updated);

// 4. Compose the lobby UI from primitives
const { canStart, readyCount } = useRoomState(room);

<RoomQRCode roomId={room.roomId} />
<PlayerSlotsGrid
  players={room.players}
  buildSlotHref={(id) => buildPlayerUrl(room.roomId, id)}
/>
<button onClick={() => startGame(room)} disabled={!canStart}>
  Start Game ({readyCount} ready)
</button>
```

## Core Concepts

### Stateless by design

`react-gameroom` never manages state internally. Every helper function takes the current `RoomState` and returns a new one. You decide where state lives — Firebase, Redux, Zustand, `useState`, anything.

### Player state machine

Each player slot follows a strict transition order:

```
empty  →  joining  →  ready
  ↑_________________________|
         resetPlayer()
```

- **empty** — slot is open for a player to claim
- **joining** — player has started joining (e.g., entering their name)
- **ready** — player is confirmed and waiting for the game to start

### Room state machine

```
lobby  →  started
```

The room transitions from `lobby` to `started` when `startGame()` is called and the readiness conditions are met (minimum players ready, and all slots filled if `requireFull` is true).

## API Reference

### Types

```ts
type PlayerStatus = "empty" | "joining" | "ready";
type RoomStatus = "lobby" | "started";

interface PlayerSlot {
  id: number;       // 1-based slot index
  status: PlayerStatus;
}

interface RoomConfig {
  minPlayers: number;
  maxPlayers: number;
  requireFull: boolean; // if true, all slots must be "ready" to start
}

interface RoomState {
  roomId: string;
  status: RoomStatus;
  players: PlayerSlot[]; // always length === maxPlayers
  config: RoomConfig;
}

interface RoomDerivedState {
  isLobby: boolean;
  isStarted: boolean;
  readyCount: number;
  emptyCount: number;
  canStart: boolean;
}
```

### Helpers

Pure functions that return a new `RoomState`. They never mutate the input.

| Function | Description |
|----------|-------------|
| `createInitialRoom(config)` | Creates a room with a generated ID and all slots empty |
| `setPlayerJoining(state, playerId)` | Transitions a slot from `empty` to `joining`. No-op otherwise. |
| `setPlayerReady(state, playerId)` | Transitions a slot from `joining` to `ready`. No-op otherwise. |
| `joinPlayer(state, playerId)` | Shorthand: `setPlayerReady(setPlayerJoining(state, id), id)` |
| `resetPlayer(state, playerId)` | Resets a slot back to `empty`. No-op if already empty. |
| `startGame(state)` | Transitions room to `started` if readiness conditions are met. |

### Hook

#### `useRoomState(roomState: RoomState): RoomDerivedState`

A memoized hook that computes derived values from room state. Returns `canStart`, `readyCount`, `emptyCount`, `isLobby`, and `isStarted`.

### Components

#### `<PlayerScreen>`

The individual player view (typically shown on a mobile device). Shows the join/ready flow during lobby, and a "Game Started" message once the game begins. Ships with no inline styles. Supports render props to replace default content for each state:

```tsx
<PlayerScreen
  roomState={roomState}
  playerId={1}
  className="my-player"
  renderStarted={() => <MyGameUI />}
  renderEmpty={() => <MyJoinForm />}
  renderReady={() => <MyReadyMessage />}
/>
```

When render props are omitted, `PlayerScreen` renders default UI with `onJoin`/`onReady` button callbacks:

```tsx
<PlayerScreen
  roomState={roomState}
  playerId={1}
  onJoin={() => {}}
  onReady={() => {}}
/>
```

#### `<PlayerSlotsGrid>`

A layout wrapper for player slot cards. Used internally by `Lobby` but available for custom layouts. Accepts `slotClassName` to forward a class to each `PlayerSlotView`, and `buildSlotHref` to render slots as links.

```tsx
<PlayerSlotsGrid
  players={roomState.players}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
  buildSlotHref={(playerId) => `/room/ABC12/player/${playerId}`}
  slotClassName="my-slot"
/>
```

#### `<PlayerSlotView>`

A single player slot showing the current status with appropriate action buttons. Exposes `data-status` (`"empty"`, `"joining"`, `"ready"`) on its wrapper element for CSS targeting. Pass `href` to render non-ready slots as `<a>` links instead of using button callbacks.

```tsx
<PlayerSlotView
  slot={roomState.players[0]}
  onJoin={() => {}}
  onReady={() => {}}
  href="/room/ABC12/player/1"
  className="my-slot"
/>
```

Style by status with attribute selectors:

```css
.my-slot[data-status="ready"] { border-color: green; }
.my-slot[data-status="joining"] { border-color: orange; }
```

#### `<RoomQRCode>`

Renders a QR code that links to the room URL.

```tsx
<RoomQRCode roomId="ABC12" size={200} />
```

#### `<JoinGame>`

A form where players enter a room code to join. Headless — style via className props.

```tsx
<JoinGame
  onJoin={async (roomCode) => { /* validate & navigate */ }}
  renderError={() => error ? <div className="error">{error}</div> : null}
  formClassName="join-form"
  labelClassName="label"
  inputClassName="input"
  buttonClassName="btn"
/>
```

#### `<RoomInfoModal>`

A `<dialog>`-based modal that displays the room code, QR code, and player join URLs. Uses the native `showModal()` API for built-in backdrop, focus trapping, and Escape to close.

```tsx
const [showInfo, setShowInfo] = useState(false);

<button onClick={() => setShowInfo(true)}>Room Info</button>
<RoomInfoModal
  roomState={roomState}
  open={showInfo}
  onClose={() => setShowInfo(false)}
  className="modal-dialog"
  closeButtonClassName="modal-close"
  linkClassName="modal-link"
/>
```

Style the backdrop via the `::backdrop` pseudo-element on your dialog class. Clicking the backdrop dismisses the modal.

### Utils

| Function | Description |
|----------|-------------|
| `generateRoomId(length?)` | Generates a random alphanumeric room code (default 5 chars) |
| `buildRoomUrl(roomId)` | Returns a full URL for `/room/{roomId}` |
| `buildPlayerUrl(roomId, playerId)` | Returns a full URL for `/room/{roomId}/player/{playerId}` |
| `parseRoomFromUrl(url)` | Parses a URL and returns `{ roomId, playerId? }` or `null` |

## Example: Rock-Paper-Scissors with Firebase

The `example/` directory contains a complete multiplayer Rock-Paper-Scissors game built with `react-gameroom`, Firebase Realtime Database, React Router, and Vite. This walkthrough explains how every piece fits together.

### How the example is structured

```
example/
  src/
    main.tsx              # App entry point with BrowserRouter
    App.tsx               # Route definitions
    firebase.ts           # Firebase initialization
    pages/
      HomePage.tsx        # "New Game" / "Join Game" buttons
      JoinGamePage.tsx    # Room code entry form
      LobbyPage.tsx       # Host view + game result display
      PlayerPage.tsx      # Player view + move selection
    hooks/
      useFirebaseRoom.ts  # Real-time Firebase ↔ RoomState sync
    components/
      NameInput.tsx       # Player name entry
      RPSPicker.tsx       # Rock / Paper / Scissors buttons
      RPSResult.tsx       # Winner announcement
```

### Routing

`App.tsx` sets up four routes that map directly to the URL conventions established by `react-gameroom`:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/join" element={<JoinGamePage />} />
  <Route path="/room/:roomId" element={<LobbyPage />} />
  <Route path="/room/:roomId/player/:playerId" element={<PlayerPage />} />
</Routes>
```

- `/` — the landing page where a host creates a game or a player chooses to join
- `/join` — the room code entry screen
- `/room/:roomId` — the host's lobby and game view (shown on a shared screen or the host's device)
- `/room/:roomId/player/:playerId` — a specific player's view (shown on their phone)

### Syncing state with Firebase

The key architectural decision in this example is using Firebase Realtime Database as the shared state backend. The `useFirebaseRoom` hook is the bridge between Firebase and `react-gameroom`:

```tsx
export function useFirebaseRoom(roomId: string | undefined) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates at rooms/{roomId}/state
    const stateRef = ref(db, `rooms/${roomId}/state`);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomState(snapshotToRoomState(data));
      }
    });
    return unsubscribe;
  }, [roomId]);

  const updateRoom = useCallback(async (newState: RoomState) => {
    await set(ref(db, `rooms/${roomId}/state`), newState);
  }, [roomId]);

  return { roomState, loading, error, updateRoom };
}
```

The pattern is: read state from Firebase, pass it to `react-gameroom` helpers to compute the next state, then write the result back to Firebase. Every device subscribed to that room path receives the update in real time.

Two additional helpers check room existence and find empty slots without subscribing:

```tsx
export async function roomExists(roomId: string): Promise<boolean> {
  const snapshot = await get(ref(db, `rooms/${roomId}/state/roomId`));
  return snapshot.exists();
}

export async function findFirstEmptySlot(roomId: string): Promise<number | null> {
  const snapshot = await get(ref(db, `rooms/${roomId}/state/players`));
  const players = parsePlayersArray(snapshot.val());
  const empty = players.find((p) => p.status === "empty");
  return empty ? empty.id : null;
}
```

### Step-by-step game flow

#### 1. Creating a room (HomePage)

When the host clicks "New Game", the app calls `createInitialRoom` from `react-gameroom` to generate a fresh `RoomState`, writes it to Firebase, and navigates to the lobby:

```tsx
async function handleNewGame() {
  const room = createInitialRoom({
    minPlayers: 2,
    maxPlayers: 2,
    requireFull: true,
  });
  await set(ref(db, `rooms/${room.roomId}/state`), room);
  navigate(`/room/${room.roomId}`);
}
```

`createInitialRoom` generates a 5-character room code (like `"X9K2M"`), creates two player slots both set to `"empty"`, and sets the room status to `"lobby"`. The `requireFull: true` config means both players must be ready before the game can start.

#### 2. Joining a room (JoinGamePage)

A player navigates to `/join` and sees the `JoinGame` component from `react-gameroom` — a text input for the room code. When they submit:

```tsx
async function handleJoin(roomCode: string) {
  const exists = await roomExists(roomCode);
  if (!exists) { setError("Room not found."); return; }

  const slotId = await findFirstEmptySlot(roomCode);
  if (slotId === null) { setError("Room is full."); return; }

  navigate(`/room/${roomCode}/player/${slotId}`);
}
```

The app validates the room exists and has an open slot, then navigates the player to their dedicated URL. Alternatively, the player can scan the QR code shown on the host's lobby screen, which encodes the room URL directly.

#### 3. The lobby (LobbyPage)

The host's lobby page composes primitives from `react-gameroom` — `RoomQRCode`, `PlayerSlotsGrid`, `useRoomState`, and `buildPlayerUrl` — into a custom themed layout:

```tsx
const { canStart, readyCount } = useRoomState(roomState);

<RoomQRCode roomId={roomState.roomId} url={buildRoomUrl(roomState.roomId, "/react-gameroom")} />

<PlayerSlotsGrid
  players={roomState.players}
  className="lobby-grid"
  slotClassName="slot"
  buildSlotHref={(id) => buildPlayerUrl(roomState.roomId, id, "/react-gameroom")}
/>

<button onClick={() => updateRoom(startGame(roomState))} disabled={!canStart}>
  Start Game
</button>
```

- `useRoomState` computes `canStart` and `readyCount` from the current room state
- `PlayerSlotsGrid` renders each slot as an `<a>` tag (via `buildSlotHref`) linking to the player's URL — when clicked, the browser navigates directly
- `startGame` transitions the room to `"started"`, synced to all devices via Firebase

#### 4. The player experience (PlayerPage)

Each player sees a page at `/room/:roomId/player/:playerId`. The page uses the `PlayerScreen` component with render props to customize each phase:

```tsx
<PlayerScreen
  roomState={roomState}
  playerId={playerId}
  className="page"
  renderStarted={() => <>{/* RPS game UI */}</>}
  renderEmpty={() => (
    <>
      <div className="player-header">Room {roomState.roomId} · Player {playerId}</div>
      <NameInput roomId={roomId} playerId={playerId} onNameSaved={handleNameSaved} />
    </>
  )}
  renderReady={() => (
    <>
      <div className="player-header">Room {roomState.roomId} · Player {playerId}</div>
      <div>Ready! Waiting for others...</div>
    </>
  )}
/>
```

- `renderEmpty` shows a name input form. When the player submits their name, `handleNameSaved` calls `joinPlayer` — a shorthand that chains `setPlayerJoining` and `setPlayerReady` into a single transition. The name is stored separately in Firebase at `rooms/{roomId}/playerNames/{playerId}` (game-specific data outside `react-gameroom`'s `RoomState`).
- `renderReady` shows a waiting message with the player's name.
- `renderStarted` switches to the game UI once the host presses "Start Game".

#### 5. Playing the game (after start)

Once `roomState.status` becomes `"started"`, the `renderStarted` callback kicks in and both the lobby page and player page show the game UI. This is where the example diverges from `react-gameroom` entirely — all game logic is custom:

**Player side** — each player sees `RPSPicker` (three buttons: Rock, Paper, Scissors). Their choice is written to Firebase:

```tsx
async function handlePick(choice: "rock" | "paper" | "scissors") {
  await set(ref(db, `rooms/${roomId}/game/choices/${playerId}`), choice);
}
```

**Host side** — the lobby page subscribes to both players' choices. When both are in, it determines the winner and writes the result:

```tsx
useEffect(() => {
  const p1 = choices[1];
  const p2 = choices[2];
  if (p1 && p2) {
    const winner = determineWinner(p1, p2);
    set(ref(db, `rooms/${roomId}/game/result`), { winner, p1Choice: p1, p2Choice: p2 });
  }
}, [choices]);
```

Both views then display the `RPSResult` component showing the final outcome.

### Firebase data model

```
rooms/
  {roomId}/
    state/            # RoomState managed by react-gameroom
      roomId
      status
      players/
        0: { id: 1, status: "ready" }
        1: { id: 2, status: "ready" }
      config: { minPlayers: 2, maxPlayers: 2, requireFull: true }
    playerNames/      # Game-specific: player display names
      1: "Alice"
      2: "Bob"
    game/             # Game-specific: RPS choices and result
      choices/
        1: "rock"
        2: "paper"
      result: { winner: 2, p1Choice: "rock", p2Choice: "paper" }
```

The `state/` subtree is the only part managed by `react-gameroom`. Everything under `playerNames/` and `game/` is application-specific data that the example manages directly with Firebase.

### Running the example

```bash
cd example
npm install
```

Create `example/.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

Start the dev server:

```bash
npm run dev -- --host
```

The `--host` flag exposes the server on your local network so you can open the player URL on a phone. Open the landing page on your computer (the host), create a game, then scan the QR code with your phone to join as a player.

## Accessibility

All components include built-in accessibility support:

- **`RoomInfoModal`** — uses the native `<dialog>` element with `showModal()`, which provides built-in `aria-modal`, focus trapping, and Escape to close. The dialog is labelled via `aria-labelledby`. The close button has an accessible label.
- **`RoomQRCode`** — the QR code SVG has `role="img"` and a descriptive `aria-label` so screen readers announce its purpose.
- **`JoinGame`** — the room code input has a visible `<label>` and `aria-required`.
- **`PlayerScreen`** — status messages ("Game Started!", "You're joining...", "Ready!") use `aria-live="polite"` regions. Invalid slot errors use `role="alert"`.
- **`PlayerSlotView`** — Join and Ready buttons have contextual `aria-label`s (e.g., "Join as Player 2"). Status text uses `aria-live="polite"`.
- **`PlayerSlotsGrid`** — uses `role="list"` with `aria-label="Player slots"` and wraps each slot in a `role="listitem"`.

Components ship with no inline styles, giving consumers full control over theming via `className` props. Browser-default focus indicators remain visible. Since the library is headless (consumers apply styles via `className`), color contrast is the consumer's responsibility.

## License

MIT
