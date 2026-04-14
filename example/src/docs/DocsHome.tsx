import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";

export function DocsHome() {
  return (
    <>
      <div className="docs-hero">
        <h1>react-gameroom</h1>
        <p className="docs-subtitle">
          A stateless React component library for multiplayer game lobby management.
          It handles player slots, room state transitions, QR code generation, and URL routing
          — you bring your own state management and game logic.
        </p>
        <div className="docs-install">
          <CodeBlock language="bash">npm install react-gameroom</CodeBlock>
        </div>
        <p>Peer dependencies: <code>react &gt;= 17.0.0</code> and <code>react-dom &gt;= 17.0.0</code>.</p>
      </div>

      <h2>Quick Start</h2>

      <CodeBlock language="tsx">{`import {
  createInitialRoom, joinPlayer, startGame,
  useRoomState, PlayerSlotsGrid, RoomQRCode, buildPlayerUrl,
} from "react-gameroom";

// 1. Create a room
const room = createInitialRoom({ minPlayers: 2, maxPlayers: 4, requireFull: false });

// 2. Transition players through the state machine: empty → joining → ready
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
</button>`}</CodeBlock>

      <h2>What's Included</h2>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>What you get</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Components</strong></td>
            <td><code>PlayerSlotsGrid</code>, <code>PlayerSlotView</code>, <code>PlayerScreen</code>, <code>RoomQRCode</code>, <code>JoinGame</code>, <code>RoomInfoModal</code></td>
          </tr>
          <tr>
            <td><strong>Helpers</strong></td>
            <td><code>createInitialRoom</code>, <code>joinPlayer</code>, <code>startGame</code>, <code>resetPlayer</code>, and more</td>
          </tr>
          <tr>
            <td><strong>Hook</strong></td>
            <td><code>useRoomState</code> — derived state with <code>canStart</code>, <code>readyCount</code>, <code>playerNames</code></td>
          </tr>
          <tr>
            <td><strong>Utils</strong></td>
            <td>URL generation/parsing, room ID generation</td>
          </tr>
        </tbody>
      </table>

      <div className="docs-next-page">
        <Link to="/guide">
          <div>
            <div className="docs-next-label">Next</div>
            <div className="docs-next-title">Guide &rarr;</div>
          </div>
        </Link>
      </div>
    </>
  );
}
