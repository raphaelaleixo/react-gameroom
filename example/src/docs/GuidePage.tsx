import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";

export function GuidePage() {
  return (
    <>
      <h1>Guide</h1>
      <p className="docs-subtitle">
        The library handles the lobby — you handle the game. A typical integration follows this pattern.
      </p>

      <h2>1. Create a room</h2>
      <p>
        Call <code>createInitialRoom</code> with your player config, persist the result to your backend, and navigate to the lobby.
      </p>
      <CodeBlock language="tsx">{`import { createInitialRoom } from "react-gameroom";

const room = createInitialRoom({ minPlayers: 2, maxPlayers: 8, requireFull: false });
await saveToBackend(room); // Firebase, Supabase, your own server, etc.
navigate(\`/room/\${room.roomId}\`);`}</CodeBlock>

      <h2>2. Build the lobby screen</h2>
      <p>
        Compose <code>PlayerSlotsGrid</code>, <code>RoomQRCode</code>, and <code>useRoomState</code> into
        your lobby page. Players join by scanning the QR code or entering the room code.
      </p>
      <CodeBlock language="tsx">{`import { useRoomState, PlayerSlotsGrid, RoomQRCode, StartGameButton, buildPlayerUrl } from "react-gameroom";

const { readyCount } = useRoomState(roomState);

<RoomQRCode roomId={roomState.roomId} />
<PlayerSlotsGrid
  players={roomState.players}
  buildSlotHref={(id) => buildPlayerUrl(roomState.roomId, id)}
/>
<StartGameButton roomState={roomState} onStart={updateRoom} />`}</CodeBlock>

      <h2>3. Build the player screen</h2>
      <p>
        Use <code>PlayerScreen</code> with render props to define what players see at each phase.
        The <code>renderEmpty</code> callback is where players enter their name and join;{" "}
        <code>renderStarted</code> is where your game UI goes.
      </p>
      <CodeBlock language="tsx">{`import { PlayerScreen, joinPlayer } from "react-gameroom";

<PlayerScreen
  roomState={roomState}
  playerId={playerId}
  renderEmpty={() => <YourJoinForm onJoin={(name) => updateRoom(joinPlayer(roomState, playerId, name))} />}
  renderReady={() => <p>Waiting for others...</p>}
  renderStarted={() => <YourGameUI />}
/>`}</CodeBlock>

      <h2>4. Add your game logic</h2>
      <p>
        Once <code>roomState.status</code> is <code>"started"</code>, the library's job is done.
        Your game-specific state (moves, scores, rounds) lives alongside <code>RoomState</code> in
        whatever backend you're using. The library doesn't know or care about your game rules.
      </p>
      <CodeBlock>{`your-backend/
  rooms/{roomId}/
    state/          <- managed by react-gameroom
    game/           <- your game data`}</CodeBlock>

      <h2>5. Optionally, let players rejoin</h2>
      <p>
        Use <code>JoinGame</code> for a room code entry form, <code>PlayerEntryScreen</code> for the
        per-room player landing route (<code>/room/{"{id}"}/player</code>), and <code>RoomInfoModal</code> to
        show room info and QR codes during gameplay.
      </p>

      <h2>Core Concepts</h2>

      <h3>Stateless by design</h3>
      <p>
        <code>react-gameroom</code> never manages state internally. Every helper function takes the
        current <code>RoomState</code> and returns a new one. You decide where state lives — Firebase,
        Redux, Zustand, <code>useState</code>, anything.
      </p>

      <h3>Player state machine</h3>
      <p>Each player slot follows a strict transition order:</p>
      <div className="docs-state-machine">
        <span className="docs-state">empty</span>
        <span className="docs-arrow">&rarr;</span>
        <span className="docs-state">joining</span>
        <span className="docs-arrow">&rarr;</span>
        <span className="docs-state">ready</span>
      </div>
      <ul>
        <li><strong>empty</strong> — slot is open for a player to claim</li>
        <li><strong>joining</strong> — player has started joining (e.g., entering their name)</li>
        <li><strong>ready</strong> — player is confirmed and waiting for the game to start</li>
      </ul>
      <p>
        Call <code>resetPlayer(state, playerId)</code> to transition any slot back to <code>empty</code>,
        clearing the name and any custom data.
      </p>

      <h3>Room state machine</h3>
      <div className="docs-state-machine">
        <span className="docs-state">lobby</span>
        <span className="docs-arrow">&rarr;</span>
        <span className="docs-state">started</span>
      </div>
      <p>
        The room transitions from <code>lobby</code> to <code>started</code> when{" "}
        <code>startGame()</code> is called and the readiness conditions are met (minimum players ready,
        and all slots filled if <code>requireFull</code> is true).
      </p>

      <h3>Custom player data</h3>
      <p>
        <code>PlayerSlot</code> is generic — you can attach game-specific data to each slot.
        The library carries it through state transitions but never reads it.
      </p>
      <CodeBlock language="tsx">{`type MyData = { role: "host" | "spy"; color: string };

const room = createInitialRoom<MyData>({ minPlayers: 2, maxPlayers: 4, requireFull: false });
const updated = joinPlayer(room, 1, "Alice", { role: "host", color: "#ff0000" });

// Access in your components
const slot = updated.players[0];
slot.data?.role; // "host" — fully typed`}</CodeBlock>
      <div className="docs-callout">
        <strong>Best for static per-player config</strong> (team color, avatar, preferred role) set once
        at join time. Avoid using <code>data</code> for live game state that changes frequently — store
        fast-changing game data in separate backend paths instead.
      </div>

      <div className="docs-next-page">
        <Link to="/api">
          <div>
            <div className="docs-next-label">Next</div>
            <div className="docs-next-title">API Reference &rarr;</div>
          </div>
        </Link>
      </div>
    </>
  );
}
