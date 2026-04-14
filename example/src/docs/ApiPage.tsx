import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";

export function ApiPage() {
  return (
    <>
      <h1>API Reference</h1>
      <p className="docs-subtitle">
        Complete reference for all types, helpers, hooks, components, and utilities.
      </p>
      <p>
        For AI coding assistants, a machine-readable API summary is available in{" "}
        <a href="https://github.com/raphaelaleixo/react-gameroom/blob/main/llms.txt">
          llms.txt
        </a>.
      </p>

      <h2>Types</h2>

      <CodeBlock language="ts">{`type PlayerStatus = "empty" | "joining" | "ready";
type RoomStatus = "lobby" | "started";

interface PlayerSlot<T = unknown> {
  id: number;       // 1-based slot index
  status: PlayerStatus;
  name?: string;    // optional display name, set via joinPlayer/setPlayerJoining
  data?: T;         // optional game-specific data (role, color, etc.)
}

interface RoomConfig {
  minPlayers: number;
  maxPlayers: number;
  requireFull: boolean; // if true, all slots must be "ready" to start
}

interface RoomState<T = unknown> {
  roomId: string;
  status: RoomStatus;
  players: PlayerSlot<T>[]; // always length === maxPlayers
  config: RoomConfig;
}

interface RoomDerivedState {
  isLobby: boolean;
  isStarted: boolean;
  readyCount: number;
  emptyCount: number;
  canStart: boolean;
  playerCount: number;    // non-empty slots (joining + ready)
  playerNames: Record<number, string>; // only named players
}`}</CodeBlock>

      <h2>Helpers</h2>

      <p>Pure functions that return a new <code>RoomState</code>. They never mutate the input.</p>

      <table>
        <thead>
          <tr><th>Function</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>createInitialRoom(config)</code></td>
            <td>Creates a room with a generated ID and all slots empty</td>
          </tr>
          <tr>
            <td><code>setPlayerJoining(state, playerId, name?, data?)</code></td>
            <td>Transitions a slot from <code>empty</code> to <code>joining</code>, optionally setting a name and custom data. No-op otherwise.</td>
          </tr>
          <tr>
            <td><code>setPlayerReady(state, playerId)</code></td>
            <td>Transitions a slot from <code>joining</code> to <code>ready</code>. No-op otherwise.</td>
          </tr>
          <tr>
            <td><code>joinPlayer(state, playerId, name?, data?)</code></td>
            <td>Shorthand: <code>setPlayerJoining</code> + <code>setPlayerReady</code> in one call, optionally setting a name and custom data.</td>
          </tr>
          <tr>
            <td><code>resetPlayer(state, playerId)</code></td>
            <td>Resets a slot back to <code>empty</code> and clears its name and data. No-op if already empty.</td>
          </tr>
          <tr>
            <td><code>findFirstEmptySlot(players)</code></td>
            <td>Returns the first slot with <code>empty</code> status, or <code>null</code> if all slots are taken. Useful for first-come-first-served lobbies.</td>
          </tr>
          <tr>
            <td><code>startGame(state)</code></td>
            <td>Transitions room to <code>started</code> if readiness conditions are met.</td>
          </tr>
        </tbody>
      </table>

      <h2>Hook</h2>

      <h3>useRoomState(roomState): RoomDerivedState</h3>
      <p>
        A memoized hook that computes derived values from room state. Returns{" "}
        <code>canStart</code>, <code>readyCount</code>, <code>emptyCount</code>,{" "}
        <code>playerCount</code>, <code>playerNames</code>, <code>isLobby</code>, and <code>isStarted</code>.
      </p>

      <h2>Components</h2>

      <p>
        All components are headless — they ship with no inline styles. Use <code>className</code> props
        and CSS attribute selectors (<code>[data-status]</code>) for styling.
      </p>

      <h3>{"<PlayerScreen>"}</h3>
      <p>
        The individual player view (typically shown on a mobile device). Shows the join/ready flow
        during lobby, and a "Game Started" message once the game begins. Supports render props to
        replace default content for each state:
      </p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={1}
  className="my-player"
  renderStarted={() => <MyGameUI />}
  renderEmpty={() => <MyJoinForm />}
  renderReady={() => <MyReadyMessage />}
/>`}</CodeBlock>
      <p>When render props are omitted, <code>PlayerScreen</code> renders default UI with <code>onJoin</code>/<code>onReady</code> button callbacks:</p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={1}
  onJoin={() => {}}
  onReady={() => {}}
/>`}</CodeBlock>

      <h3>{"<PlayerSlotsGrid>"}</h3>
      <p>
        A layout wrapper for player slot cards. Accepts <code>slotClassName</code> to forward a class
        to each <code>PlayerSlotView</code>, and <code>buildSlotHref</code> to render slots as links.
      </p>
      <CodeBlock language="tsx">{`<PlayerSlotsGrid
  players={roomState.players}
  onJoin={(playerId) => {}}
  onReady={(playerId) => {}}
  buildSlotHref={(playerId) => \`/room/ABC12/player/\${playerId}\`}
  slotClassName="my-slot"
/>`}</CodeBlock>

      <h3>{"<PlayerSlotView>"}</h3>
      <p>
        A single player slot showing the current status with appropriate action buttons.
        Exposes <code>data-status</code> (<code>"empty"</code>, <code>"joining"</code>,{" "}
        <code>"ready"</code>) on its wrapper element for CSS targeting. Pass <code>href</code> to
        render non-ready slots as links.
      </p>
      <CodeBlock language="tsx">{`<PlayerSlotView
  slot={roomState.players[0]}
  onJoin={() => {}}
  onReady={() => {}}
  href="/room/ABC12/player/1"
  className="my-slot"
/>`}</CodeBlock>
      <p>Style by status with attribute selectors:</p>
      <CodeBlock language="css">{`.my-slot[data-status="ready"] { border-color: green; }
.my-slot[data-status="joining"] { border-color: orange; }`}</CodeBlock>

      <h3>{"<RoomQRCode>"}</h3>
      <p>Renders a QR code that links to the room URL.</p>
      <CodeBlock language="tsx">{`<RoomQRCode roomId="ABC12" size={200} />`}</CodeBlock>

      <h3>{"<JoinGame>"}</h3>
      <p>A form where players enter a room code to join. Headless — style via className props. Supports async <code>onJoin</code> with built-in submitting state.</p>
      <CodeBlock language="tsx">{`<JoinGame
  onJoin={async (roomCode) => { /* validate & navigate */ }}
  renderError={() => error ? <div className="error">{error}</div> : null}
  formClassName="join-form"
  labelClassName="label"
  inputClassName="input"
  buttonClassName="btn"
/>`}</CodeBlock>

      <h3>{"<RoomInfoModal>"}</h3>
      <p>
        A <code>&lt;dialog&gt;</code>-based modal that displays the room code, QR code, and player
        join URLs. Uses the native <code>showModal()</code> API for built-in backdrop, focus trapping,
        and Escape to close.
      </p>
      <CodeBlock language="tsx">{`const [showInfo, setShowInfo] = useState(false);

<button onClick={() => setShowInfo(true)}>Room Info</button>
<RoomInfoModal
  roomState={roomState}
  open={showInfo}
  onClose={() => setShowInfo(false)}
  className="modal-dialog"
  closeButtonClassName="modal-close"
  linkClassName="modal-link"
/>`}</CodeBlock>
      <p>Style the backdrop via the <code>::backdrop</code> pseudo-element on your dialog class.</p>

      <h2>Utils</h2>

      <table>
        <thead>
          <tr><th>Function</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>generateRoomId(length?)</code></td>
            <td>Generates a random alphanumeric room code (default 5 chars)</td>
          </tr>
          <tr>
            <td><code>buildRoomUrl(roomId, basePath?)</code></td>
            <td>Returns a full URL for <code>/room/{"{roomId}"}</code></td>
          </tr>
          <tr>
            <td><code>buildPlayerUrl(roomId, playerId, basePath?)</code></td>
            <td>Returns a full URL for <code>/room/{"{roomId}"}/player/{"{playerId}"}</code></td>
          </tr>
          <tr>
            <td><code>buildJoinUrl(roomId, basePath?)</code></td>
            <td>Returns a URL for <code>/room/{"{roomId}"}/player</code> (no slot number). Used for first-come-first-served lobbies.</td>
          </tr>
          <tr>
            <td><code>parseRoomFromUrl(url)</code></td>
            <td>Parses a URL and returns <code>{"{ roomId, playerId?, isJoin? }"}</code> or <code>null</code>. Returns <code>isJoin: true</code> for <code>/room/{"{roomId}"}/player</code> (no slot number).</td>
          </tr>
        </tbody>
      </table>

      <h2>Accessibility</h2>
      <ul>
        <li><strong>RoomInfoModal</strong> — native <code>&lt;dialog&gt;</code> with <code>showModal()</code>, built-in <code>aria-modal</code>, focus trapping, Escape to close</li>
        <li><strong>RoomQRCode</strong> — <code>role="img"</code> with descriptive <code>aria-label</code></li>
        <li><strong>JoinGame</strong> — visible <code>&lt;label&gt;</code> and <code>aria-required</code></li>
        <li><strong>PlayerScreen</strong> — <code>aria-live="polite"</code> status regions, <code>role="alert"</code> for errors</li>
        <li><strong>PlayerSlotView</strong> — contextual <code>aria-label</code>s, <code>aria-live="polite"</code> status</li>
        <li><strong>PlayerSlotsGrid</strong> — <code>role="list"</code> with <code>aria-label</code></li>
      </ul>

      <div className="docs-next-page">
        <Link to="/examples">
          <div>
            <div className="docs-next-label">Next</div>
            <div className="docs-next-title">Examples &rarr;</div>
          </div>
        </Link>
      </div>
    </>
  );
}
