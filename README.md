# react-gameroom

A stateless React component library for multiplayer game lobby management. It handles player slots, room state transitions, QR code generation, and URL routing — you bring your own state management and game logic.

## Install

```bash
npm install react-gameroom
```

Peer dependencies: `react >= 17.0.0` and `react-dom >= 17.0.0`.

## Quick Start

```tsx
import { createInitialRoom, joinPlayer, startGame, Lobby } from "react-gameroom";

// 1. Create a room
const room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });

// 2. Transition players through the state machine: empty → joining → ready
const updated = joinPlayer(room, 1); // Player 1 joins and is immediately ready

// 3. Start the game when conditions are met
const started = startGame(updated);

// 4. Render the lobby UI
<Lobby
  roomState={room}
  onJoin={(playerId) => { /* transition player to joining */ }}
  onReady={(playerId) => { /* transition player to ready */ }}
  onStart={() => { /* start the game */ }}
/>
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

A memoized hook that computes derived values from room state. Returns `canStart`, `readyCount`, `emptyCount`, `isLobby`, and `isStarted`. This is used internally by the `Lobby` component and is also available for custom UIs.

### Components

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

#### `<PlayerScreen>`

The individual player view (typically shown on a mobile device). Shows the join/ready flow during lobby, and a "Game Started" message once the game begins.

```tsx
<PlayerScreen
  roomState={roomState}
  playerId={1}
  onJoin={() => {}}
  onReady={() => {}}
/>
```

#### `<PlayerSlotsGrid>`

A CSS Grid layout of player slot cards. Used internally by `Lobby` but available for custom layouts.

```tsx
<PlayerSlotsGrid
  players={roomState.players}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
/>
```

#### `<PlayerSlotView>`

A single player slot card showing the current status with appropriate action buttons.

```tsx
<PlayerSlotView
  slot={roomState.players[0]}
  onJoin={() => {}}
  onReady={() => {}}
/>
```

#### `<RoomQRCode>`

Renders a QR code that links to the room URL.

```tsx
<RoomQRCode roomId="ABC12" size={200} />
```

#### `<JoinGame>`

A form where players enter a room code to join.

```tsx
<JoinGame onJoin={(roomCode) => {}} />
```

#### `<RoomInfoModal>`

A modal overlay that displays the room code, QR code, and player join URLs. Useful for letting players access room info at any point during gameplay.

```tsx
const [showInfo, setShowInfo] = useState(false);

<button onClick={() => setShowInfo(true)}>Room Info</button>
<RoomInfoModal
  roomState={roomState}
  open={showInfo}
  onClose={() => setShowInfo(false)}
/>
```

The modal renders a semi-transparent backdrop (click to dismiss), QR code (via `RoomQRCode`), and a list of player URLs. It uses minimal inline styles for positioning — apply your own theme via the optional `className` prop.

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

The host sees the `Lobby` component from `react-gameroom`, which displays the room code, a QR code, and a grid showing each player slot's status:

```tsx
<Lobby
  roomState={roomState}
  onJoin={(playerId) => navigate(`/room/${roomId}/player/${playerId}`)}
  onReady={(playerId) => updateRoom(setPlayerReady(roomState, playerId))}
  onStart={() => updateRoom(startGame(roomState))}
/>
```

The callback pattern is central to how `react-gameroom` works:
- `onJoin` — a slot was clicked in the lobby; the host navigates to that player's URL (useful for local play on a single device)
- `onReady` — calls `setPlayerReady` to compute the next state, then `updateRoom` writes it to Firebase
- `onStart` — calls `startGame` to transition the room, synced to all devices via Firebase

#### 4. The player experience (PlayerPage)

Each player sees a page at `/room/:roomId/player/:playerId`. During the lobby phase, they enter their name and are marked as ready:

```tsx
// Name entry triggers joinPlayer, which transitions empty → joining → ready
async function handleNameSaved() {
  await updateRoom(joinPlayer(roomState, playerId));
}
```

The `joinPlayer` helper is a shorthand that chains `setPlayerJoining` and `setPlayerReady` into a single transition. The player's name is stored separately in Firebase at `rooms/{roomId}/playerNames/{playerId}` — this is game-specific data that lives outside `react-gameroom`'s `RoomState`.

After both players are ready, the host presses "Start Game".

#### 5. Playing the game (after start)

Once `roomState.status` becomes `"started"`, both the lobby page and player page switch to the game UI. This is where the example diverges from `react-gameroom` entirely — all game logic is custom:

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

## License

MIT
