# react-gameroom

A stateless React component library for multiplayer game lobby management. It handles player slots, room state transitions, QR code generation, and URL routing — you bring your own state management and game logic.

**[Documentation](https://raphaelaleixo.github.io/react-gameroom/)** | **[Live Demo](https://raphaelaleixo.github.io/react-gameroom/play)**

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

// 2. Players join with a name
const updated = joinPlayer(room, 1, "Alice");

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

## What's Included

| Category | Exports |
|----------|---------|
| **Components** | `PlayerSlotsGrid`, `PlayerSlotView`, `PlayerScreen`, `RoomQRCode`, `JoinGame`, `RoomInfoModal` |
| **Helpers** | `createInitialRoom`, `joinPlayer`, `startGame`, `resetPlayer`, `setPlayerJoining`, `setPlayerReady` |
| **Hook** | `useRoomState` — derived state with `canStart`, `readyCount`, `playerCount`, `playerNames` |
| **Utils** | `generateRoomId`, `buildRoomUrl`, `buildPlayerUrl`, `parseRoomFromUrl` |

## Key Features

- **Stateless** — helpers take state in, return new state out. You own the state management.
- **Headless** — components ship with no inline styles. Style via `className` props and `data-status` attributes.
- **Player identity** — optional `name` and generic `data<T>` on each slot, carried through transitions.
- **Accessible** — native `<dialog>`, `aria-live` regions, focus trapping, semantic markup.
- **Flexible** — works with Firebase, Supabase, your own server, or plain `useState`.

## Learn More

- **[Guide](https://raphaelaleixo.github.io/react-gameroom/guide)** — step-by-step integration walkthrough
- **[API Reference](https://raphaelaleixo.github.io/react-gameroom/api)** — types, helpers, hooks, components, utils
- **[Examples](https://raphaelaleixo.github.io/react-gameroom/examples)** — Rock-Paper-Scissors with Firebase walkthrough
- **[Live Demo](https://raphaelaleixo.github.io/react-gameroom/play)** — try it in your browser
- **[`llms.txt`](./llms.txt)** — AI-friendly API reference

## License

MIT
