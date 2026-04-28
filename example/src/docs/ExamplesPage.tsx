import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";

export function ExamplesPage() {
  return (
    <>
      <h1>Examples</h1>
      <p className="docs-subtitle">
        A complete multiplayer Rock-Paper-Scissors game built with react-gameroom,
        Firebase Realtime Database, React Router, and Vite.
      </p>

      <div className="docs-callout">
        <Link to="/play" style={{ fontWeight: 700 }}>Try the live demo</Link> — create a game on your computer, scan the QR code with your phone to join as a player.
      </div>

      <h2>Project Structure</h2>

      <CodeBlock>{`src/
  main.tsx              # App entry point with BrowserRouter
  App.tsx               # Route definitions
  firebase.ts           # Firebase initialization
  pages/
    HomePage.tsx        # "New Game" / "Join Game" buttons
    JoinGamePage.tsx    # Room code entry form
    PlayerEntryPage.tsx # Auto-assign first empty slot, or rejoin grid if started
    LobbyPage.tsx       # Host view + game result display
    PlayerPage.tsx      # Player view + move selection
  hooks/
    useFirebaseRoom.ts  # Real-time Firebase <-> RoomState sync
  components/
    NameInput.tsx       # Player name entry
    RPSPicker.tsx       # Rock / Paper / Scissors buttons
    RPSResult.tsx       # Winner announcement`}</CodeBlock>

      <h2>Routing</h2>

      <p>Five routes map directly to the URL conventions established by react-gameroom:</p>

      <CodeBlock language="tsx">{`<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/join" element={<JoinGamePage />} />
  <Route path="/room/:roomId" element={<LobbyPage />} />
  <Route path="/room/:roomId/player" element={<PlayerEntryPage />} />
  <Route path="/room/:roomId/player/:playerId" element={<PlayerPage />} />
</Routes>`}</CodeBlock>

      <ul>
        <li><code>/</code> — the landing page where a host creates a game or a player chooses to join</li>
        <li><code>/join</code> — the room code entry screen</li>
        <li><code>/room/:roomId</code> — the host's lobby and game view</li>
        <li><code>/room/:roomId/player</code> — first-come-first-served seat-assignment landing</li>
        <li><code>/room/:roomId/player/:playerId</code> — a player's view (on their phone)</li>
      </ul>

      <h2>Syncing State with Firebase</h2>

      <p>
        The <code>useFirebaseRoom</code> hook bridges Firebase and react-gameroom. The pattern:
        read state from Firebase, pass it to helpers to compute the next state, write the result back.
      </p>

      <CodeBlock language="tsx">{`export function useFirebaseRoom(roomId: string | undefined) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stateRef = ref(db, \`rooms/\${roomId}/state\`);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setRoomState(snapshotToRoomState(data));
    });
    return unsubscribe;
  }, [roomId]);

  const updateRoom = useCallback(async (newState: RoomState) => {
    await set(ref(db, \`rooms/\${roomId}/state\`), newState);
  }, [roomId]);

  return { roomState, loading, error, updateRoom };
}`}</CodeBlock>

      <h2>Step-by-Step Game Flow</h2>

      <h3>1. Creating a room</h3>
      <p>
        The host clicks "New Game", <code>createInitialRoom</code> generates a room, it's written to Firebase,
        and the app navigates to the lobby:
      </p>
      <CodeBlock language="tsx">{`async function handleNewGame() {
  const room = createInitialRoom({
    minPlayers: 2,
    maxPlayers: 2,
    requireFull: true,
  });
  await set(ref(db, \`rooms/\${room.roomId}/state\`), room);
  navigate(\`/room/\${room.roomId}\`);
}`}</CodeBlock>

      <h3>2. Joining a room</h3>
      <p>
        A player enters a room code via the <code>JoinGame</code> component. The app validates the room exists
        and has an open slot, then navigates to the player URL:
      </p>
      <CodeBlock language="tsx">{`async function handleJoin(roomCode: string) {
  const exists = await roomExists(roomCode);
  if (!exists) { setError("Room not found."); return; }

  const slotId = await findFirstEmptySlot(roomCode);
  if (slotId === null) { setError("Room is full."); return; }

  navigate(\`/room/\${roomCode}/player/\${slotId}\`);
}`}</CodeBlock>

      <h3>3. The lobby</h3>
      <p>
        The host's lobby composes primitives from react-gameroom into a themed layout:
      </p>
      <CodeBlock language="tsx">{`const { canStart, readyCount } = useRoomState(roomState);

<RoomQRCode roomId={roomState.roomId} />
<PlayerSlotsGrid
  players={roomState.players}
  slotClassName="slot"
  buildSlotHref={(id) => buildPlayerUrl(roomState.roomId, id)}
/>
<button onClick={() => updateRoom(startGame(roomState))} disabled={!canStart}>
  Start Game
</button>`}</CodeBlock>

      <h3>4. The player experience</h3>
      <p>
        Each player uses <code>PlayerScreen</code> with render props to customize each phase:
      </p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={playerId}
  renderStarted={() => <>{/* RPS game UI */}</>}
  renderEmpty={() => (
    <>
      <NameInput onNameSaved={(name) => updateRoom(joinPlayer(roomState, playerId, name))} />
    </>
  )}
  renderReady={() => <div>Ready! Waiting for others...</div>}
/>`}</CodeBlock>

      <h3>5. Playing the game</h3>
      <p>
        Once started, the library's job is done. Players pick rock/paper/scissors, the host determines
        the winner — all custom logic:
      </p>
      <CodeBlock language="tsx">{`// Player picks a move
async function handlePick(choice: "rock" | "paper" | "scissors") {
  await set(ref(db, \`rooms/\${roomId}/game/choices/\${playerId}\`), choice);
}

// Host determines winner when both picks are in
useEffect(() => {
  if (choices[1] && choices[2]) {
    const winner = determineWinner(choices[1], choices[2]);
    set(ref(db, \`rooms/\${roomId}/game/result\`), { winner, ... });
  }
}, [choices]);`}</CodeBlock>

      <h2>Firebase Data Model</h2>

      <CodeBlock>{`rooms/
  {roomId}/
    state/            # RoomState managed by react-gameroom
      roomId
      status
      players/
        0: { id: 1, status: "ready", name: "Alice" }
        1: { id: 2, status: "ready", name: "Bob" }
      config: { minPlayers: 2, maxPlayers: 2, requireFull: true }
    game/             # Game-specific: RPS choices and result
      choices/
        1: "rock"
        2: "paper"
      result: { winner: 2, p1Choice: "rock", p2Choice: "paper" }`}</CodeBlock>

      <p>
        The <code>state/</code> subtree is managed by react-gameroom — including player names on{" "}
        <code>PlayerSlot</code>. Everything under <code>game/</code> is application-specific data managed
        directly with Firebase.
      </p>

      <h2>Running Locally</h2>

      <CodeBlock language="bash">{`cd example
npm install`}</CodeBlock>

      <p>Create <code>.env</code> with your Firebase config:</p>

      <CodeBlock>{`VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id`}</CodeBlock>

      <CodeBlock language="bash">npm run dev -- --host</CodeBlock>

      <p>
        The <code>--host</code> flag exposes the server on your local network so you can open the player
        URL on a phone. Open the landing page on your computer, create a game, then scan the QR code with
        your phone to join.
      </p>

      <div className="docs-next-page">
        <Link to="/play">
          <div>
            <div className="docs-next-label">Next</div>
            <div className="docs-next-title">Try the live demo &rarr;</div>
          </div>
        </Link>
      </div>
    </>
  );
}
