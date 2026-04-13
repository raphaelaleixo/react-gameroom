# Example App UI Redesign + RoomInfoModal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the example RPS app with a dark/gaming aesthetic and add a reusable `RoomInfoModal` library component for accessing room info (QR code + player links) at any point during gameplay.

**Architecture:** Single CSS file (`example/src/styles.css`) for all dark theme styling. One new library component (`RoomInfoModal`) exported from the barrel. Example pages replace inline styles with CSS classes and add the room info modal to game-started views.

**Tech Stack:** React, TypeScript, CSS (no new dependencies)

---

## File Structure

### Library (new)
- `src/components/RoomInfoModal.tsx` — modal overlay showing QR code + player URLs, theme-agnostic
- `src/index.ts` — add RoomInfoModal + RoomInfoModalProps exports

### Example (new)
- `example/src/styles.css` — complete dark/gaming theme stylesheet

### Example (modified)
- `example/src/main.tsx` — import styles.css
- `example/src/pages/HomePage.tsx` — title screen redesign
- `example/src/pages/JoinGamePage.tsx` — dark theme restyle
- `example/src/pages/LobbyPage.tsx` — lobby restyle + versus screen + room info modal
- `example/src/pages/PlayerPage.tsx` — dark theme + touch-friendly RPS + room info modal
- `example/src/components/RPSPicker.tsx` — emoji-based buttons with dark theme classes
- `example/src/components/RPSResult.tsx` — styled versus result
- `example/src/components/NameInput.tsx` — dark theme input

### Docs (modified)
- `README.md` — document RoomInfoModal component

---

### Task 1: Create RoomInfoModal library component

**Files:**
- Create: `src/components/RoomInfoModal.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Create `src/components/RoomInfoModal.tsx`**

```tsx
import React from "react";
import type { RoomState } from "../types/room";
import { RoomQRCode } from "./RoomQRCode";
import { buildPlayerUrl } from "../utils/roomUtils";

export interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function RoomInfoModal({ roomState, open, onClose, className }: RoomInfoModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className={className}
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 24,
          borderRadius: 12,
          maxWidth: 400,
          width: "90%",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "inherit",
          }}
        >
          ✕
        </button>

        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Room: {roomState.roomId}</h3>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <RoomQRCode roomId={roomState.roomId} size={160} />
        </div>

        <div>
          {roomState.players.map((slot) => {
            const url = buildPlayerUrl(roomState.roomId, slot.id);
            return (
              <div key={slot.id} style={{ marginBottom: 8, fontSize: 14 }}>
                <div style={{ marginBottom: 2 }}>Player {slot.id}:</div>
                <a href={url} style={{ wordBreak: "break-all" }}>{url}</a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add exports to `src/index.ts`**

Add after the existing `JoinGame` exports block:

```ts
export { RoomInfoModal } from "./components/RoomInfoModal";
export type { RoomInfoModalProps } from "./components/RoomInfoModal";
```

- [ ] **Step 3: Verify the library type-checks**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/RoomInfoModal.tsx src/index.ts
git commit -m "feat: add RoomInfoModal library component"
```

---

### Task 2: Create dark theme CSS file and import it

**Files:**
- Create: `example/src/styles.css`
- Modify: `example/src/main.tsx`

- [ ] **Step 1: Create `example/src/styles.css`**

```css
/* ========================================
   Dark / Gaming Theme for react-gameroom example
   ======================================== */

:root {
  --bg-primary: #1a1a2e;
  --bg-surface: #16213e;
  --border: #0f3460;
  --accent: #e94560;
  --accent-glow: rgba(233, 69, 96, 0.4);
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  min-height: 100vh;
}

a {
  color: var(--accent);
}

/* ---- Page layouts ---- */

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.page-top {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

/* ---- Title screen (HomePage) ---- */

.title {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 4px;
  text-align: center;
  margin-bottom: 8px;
}

.title-emoji {
  font-size: 64px;
  margin-bottom: 32px;
  display: flex;
  gap: 24px;
  justify-content: center;
}

/* ---- Buttons ---- */

.btn {
  padding: 14px 32px;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: 2px solid var(--accent);
  border-radius: 8px;
  background: var(--accent);
  color: var(--text-primary);
  cursor: pointer;
  box-shadow: 0 0 16px var(--accent-glow);
  transition: box-shadow 0.2s, opacity 0.2s;
}

.btn:hover {
  box-shadow: 0 0 24px var(--accent-glow), 0 0 48px rgba(233, 69, 96, 0.2);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.btn--secondary {
  background: transparent;
  color: var(--accent);
}

.btn--secondary:hover {
  background: rgba(233, 69, 96, 0.1);
}

/* ---- Cards / Surfaces ---- */

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

/* ---- Inputs ---- */

.input {
  padding: 10px 14px;
  font-size: 16px;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.input::placeholder {
  color: var(--text-secondary);
}

/* ---- Error / Status text ---- */

.text-secondary {
  color: var(--text-secondary);
}

.text-accent {
  color: var(--accent);
}

.text-error {
  color: #ff6b6b;
  margin-top: 12px;
}

/* ---- Room badge ---- */

.room-badge {
  display: inline-block;
  padding: 8px 20px;
  border: 2px solid var(--accent);
  border-radius: 8px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--accent);
}

/* ---- QR code wrapper ---- */

.qr-wrapper {
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: inline-block;
}

/* ---- Player slots (overrides library inline styles) ---- */

.slot {
  background: var(--bg-surface);
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-width: 140px;
}

.slot--joining {
  border-style: solid;
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.slot--ready {
  border-style: solid;
  border-color: var(--accent);
}

.slot-label {
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.slot-status-ready {
  color: var(--accent);
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* ---- Lobby layout ---- */

.lobby-header {
  text-align: center;
  margin-bottom: 24px;
}

.lobby-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.lobby-ready-count {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 16px;
}

/* ---- Versus screen (game started, host view) ---- */

.vs-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin: 32px 0;
  flex-wrap: wrap;
}

.vs-player {
  text-align: center;
  min-width: 140px;
}

.vs-player-name {
  font-size: 16px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.vs-player-choice {
  font-size: 72px;
  line-height: 1;
  margin-bottom: 8px;
}

.vs-player-choice-label {
  font-size: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.vs-divider {
  font-size: 48px;
  font-weight: 900;
  color: var(--accent);
  text-shadow: 0 0 20px var(--accent-glow);
}

.vs-hidden {
  font-size: 72px;
  line-height: 1;
  color: var(--text-secondary);
}

.vs-waiting {
  color: var(--text-secondary);
  font-size: 16px;
  margin-top: 16px;
}

/* ---- Result announcement ---- */

.result-announce {
  font-size: 32px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--accent);
  text-shadow: 0 0 20px var(--accent-glow);
  margin-top: 24px;
}

.result-draw {
  color: var(--text-primary);
  text-shadow: none;
}

/* ---- RPS Picker (player mobile view) ---- */

.rps-picker {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
}

.rps-btn {
  width: 80px;
  height: 80px;
  font-size: 36px;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.rps-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.rps-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ---- Info button (room info modal trigger) ---- */

.info-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 12px var(--accent-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.info-btn:hover {
  box-shadow: 0 0 20px var(--accent-glow);
}

/* ---- Room info modal (dark theme override) ---- */

.room-info-modal {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.room-info-modal a {
  color: var(--accent);
  font-size: 13px;
}

/* ---- Player page header ---- */

.player-header {
  font-size: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 24px;
}

/* ---- Name input group ---- */

.name-input-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

/* ---- Join game page ---- */

.join-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 320px;
}

.join-form .input {
  text-align: center;
  font-size: 24px;
  letter-spacing: 6px;
  text-transform: uppercase;
  width: 100%;
}

/* ---- Back link ---- */

.back-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  margin-top: 24px;
}

.back-link:hover {
  color: var(--accent);
}
```

- [ ] **Step 2: Import `styles.css` in `example/src/main.tsx`**

Replace the entire file with:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 3: Commit**

```bash
git add example/src/styles.css example/src/main.tsx
git commit -m "feat(example): add dark/gaming theme CSS and import in main"
```

---

### Task 3: Restyle HomePage as title screen

**Files:**
- Modify: `example/src/pages/HomePage.tsx`

- [ ] **Step 1: Replace `example/src/pages/HomePage.tsx`**

```tsx
import { useNavigate } from "react-router-dom";
import { set, ref } from "firebase/database";
import { createInitialRoom } from "react-gameroom";
import { db } from "../firebase";

export function HomePage() {
  const navigate = useNavigate();

  async function handleNewGame() {
    const room = createInitialRoom({
      minPlayers: 2,
      maxPlayers: 2,
      requireFull: true,
    });
    await set(ref(db, `rooms/${room.roomId}/state`), room);
    navigate(`/room/${room.roomId}`);
  }

  function handleJoinGame() {
    navigate("/join");
  }

  return (
    <div className="page">
      <h1 className="title">Rock Paper Scissors</h1>
      <div className="title-emoji">
        <span>✊</span>
        <span>✋</span>
        <span>✌️</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 280 }}>
        <button type="button" className="btn" onClick={handleNewGame}>
          New Game
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleJoinGame}>
          Join Game
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the example type-checks**

Run: `cd example && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add example/src/pages/HomePage.tsx
git commit -m "feat(example): restyle HomePage as dark/gaming title screen"
```

---

### Task 4: Restyle JoinGamePage

**Files:**
- Modify: `example/src/pages/JoinGamePage.tsx`

- [ ] **Step 1: Replace `example/src/pages/JoinGamePage.tsx`**

```tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { roomExists, findFirstEmptySlot } from "../hooks/useFirebaseRoom";

export function JoinGamePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!code.trim()) return;
    setError(null);

    const trimmed = code.trim().toUpperCase();
    const exists = await roomExists(trimmed);
    if (!exists) {
      setError("Room not found. Check the code and try again.");
      return;
    }

    const slotId = await findFirstEmptySlot(trimmed);
    if (slotId === null) {
      setError("Room is full.");
      return;
    }

    navigate(`/room/${trimmed}/player/${slotId}`);
  }

  return (
    <div className="page">
      <h2 className="text-accent" style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Join a Game
      </h2>
      <div className="join-form">
        <input
          className="input"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ROOM CODE"
          maxLength={10}
        />
        <button
          type="button"
          className="btn"
          onClick={handleJoin}
          disabled={!code.trim()}
          style={{ width: "100%" }}
        >
          Join
        </button>
      </div>
      {error && <div className="text-error">{error}</div>}
      <Link to="/" className="back-link">← Back</Link>
    </div>
  );
}
```

Note: This page now inlines the join form instead of using the library `JoinGame` component, because the library component has its own inline styles that clash with the dark theme. This is fine — the library's `JoinGame` is still available for consumers who want the default look.

- [ ] **Step 2: Verify the example type-checks**

Run: `cd example && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add example/src/pages/JoinGamePage.tsx
git commit -m "feat(example): restyle JoinGamePage with dark theme"
```

---

### Task 5: Restyle NameInput component

**Files:**
- Modify: `example/src/components/NameInput.tsx`

- [ ] **Step 1: Replace `example/src/components/NameInput.tsx`**

```tsx
import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "../firebase";

interface NameInputProps {
  roomId: string;
  playerId: number;
  onNameSaved?: () => void;
}

export function NameInput({ roomId, playerId, onNameSaved }: NameInputProps) {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const nameRef = ref(db, `rooms/${roomId}/playerNames/${playerId}`);
    const unsubscribe = onValue(nameRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setName(val);
        setSaved(true);
      }
    });
    return unsubscribe;
  }, [roomId, playerId]);

  async function handleSave() {
    if (!name.trim()) return;
    await set(ref(db, `rooms/${roomId}/playerNames/${playerId}`), name.trim());
    setSaved(true);
    onNameSaved?.();
  }

  if (saved) {
    return (
      <div className="text-secondary" style={{ marginBottom: 12 }}>
        Playing as: <span className="text-accent">{name}</span>
      </div>
    );
  }

  return (
    <div className="name-input-group">
      <input
        className="input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button
        type="button"
        className="btn"
        onClick={handleSave}
        disabled={!name.trim()}
        style={{ padding: "10px 20px", fontSize: 14 }}
      >
        OK
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add example/src/components/NameInput.tsx
git commit -m "feat(example): restyle NameInput with dark theme"
```

---

### Task 6: Restyle RPSPicker with emoji buttons

**Files:**
- Modify: `example/src/components/RPSPicker.tsx`

- [ ] **Step 1: Replace `example/src/components/RPSPicker.tsx`**

```tsx
type Choice = "rock" | "paper" | "scissors";

interface RPSPickerProps {
  onPick: (choice: Choice) => void;
  disabled: boolean;
}

const choices: { value: Choice; emoji: string }[] = [
  { value: "rock", emoji: "✊" },
  { value: "paper", emoji: "✋" },
  { value: "scissors", emoji: "✌️" },
];

export function RPSPicker({ onPick, disabled }: RPSPickerProps) {
  return (
    <div className="rps-picker">
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          className="rps-btn"
          onClick={() => onPick(c.value)}
          disabled={disabled}
          title={c.value}
        >
          {c.emoji}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add example/src/components/RPSPicker.tsx
git commit -m "feat(example): restyle RPSPicker with emoji buttons"
```

---

### Task 7: Restyle RPSResult as dramatic versus display

**Files:**
- Modify: `example/src/components/RPSResult.tsx`

- [ ] **Step 1: Replace `example/src/components/RPSResult.tsx`**

```tsx
const choiceEmoji: Record<string, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

interface RPSResultProps {
  result: {
    winner: number;
    p1Choice: string;
    p2Choice: string;
  };
  playerNames: Record<number, string>;
}

export function RPSResult({ result, playerNames }: RPSResultProps) {
  const name1 = playerNames[1] || "Player 1";
  const name2 = playerNames[2] || "Player 2";

  const winnerText =
    result.winner === 0
      ? "It's a draw!"
      : `${playerNames[result.winner] || `Player ${result.winner}`} wins!`;

  return (
    <div style={{ textAlign: "center" }}>
      <div className="vs-screen">
        <div className="vs-player">
          <div className="vs-player-name">{name1}</div>
          <div className="vs-player-choice">{choiceEmoji[result.p1Choice] || "?"}</div>
          <div className="vs-player-choice-label">{result.p1Choice}</div>
        </div>
        <div className="vs-divider">VS</div>
        <div className="vs-player">
          <div className="vs-player-name">{name2}</div>
          <div className="vs-player-choice">{choiceEmoji[result.p2Choice] || "?"}</div>
          <div className="vs-player-choice-label">{result.p2Choice}</div>
        </div>
      </div>
      <div className={`result-announce ${result.winner === 0 ? "result-draw" : ""}`}>
        {winnerText}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add example/src/components/RPSResult.tsx
git commit -m "feat(example): restyle RPSResult as dramatic versus display"
```

---

### Task 8: Restyle LobbyPage with versus screen and room info modal

**Files:**
- Modify: `example/src/pages/LobbyPage.tsx`

- [ ] **Step 1: Replace `example/src/pages/LobbyPage.tsx`**

```tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import {
  setPlayerReady,
  startGame,
  useRoomState,
  RoomQRCode,
  RoomInfoModal,
  buildPlayerUrl,
} from "react-gameroom";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";
import { RPSResult } from "../components/RPSResult";
import { db } from "../firebase";

const choiceEmoji: Record<string, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

function determineWinner(p1: string, p2: string): number {
  if (p1 === p2) return 0;
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return 1;
  }
  return 2;
}

export function LobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { roomState, loading, error, updateRoom } = useFirebaseRoom(roomId);

  const [choices, setChoices] = useState<Record<number, string>>({});
  const [gameResult, setGameResult] = useState<{
    winner: number;
    p1Choice: string;
    p2Choice: string;
  } | null>(null);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [showInfo, setShowInfo] = useState(false);

  const derived = useRoomState(roomState ?? {
    roomId: "", status: "lobby", players: [], config: { minPlayers: 0, maxPlayers: 0, requireFull: false },
  });

  useEffect(() => {
    if (!roomId) return;

    const choicesRef = ref(db, `rooms/${roomId}/game/choices`);
    const unsub1 = onValue(choicesRef, (snapshot) => {
      setChoices(snapshot.val() || {});
    });

    const resultRef = ref(db, `rooms/${roomId}/game/result`);
    const unsub2 = onValue(resultRef, (snapshot) => {
      setGameResult(snapshot.val());
    });

    const namesRef = ref(db, `rooms/${roomId}/playerNames`);
    const unsub3 = onValue(namesRef, (snapshot) => {
      setPlayerNames(snapshot.val() || {});
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || gameResult) return;
    const p1 = choices[1];
    const p2 = choices[2];
    if (p1 && p2) {
      const winner = determineWinner(p1, p2);
      const result = { winner, p1Choice: p1, p2Choice: p2 };
      set(ref(db, `rooms/${roomId}/game/result`), result);
    }
  }, [choices, roomId, gameResult]);

  if (loading) return <div className="page"><div className="text-secondary">Loading...</div></div>;
  if (error || !roomState) return <div className="page"><div className="text-error">Room not found.</div></div>;

  // Game started — versus screen
  if (roomState.status === "started") {
    const name1 = playerNames[1] || "Player 1";
    const name2 = playerNames[2] || "Player 2";
    const waitingCount = 2 - Object.keys(choices).length;

    return (
      <div className="page">
        <button type="button" className="info-btn" onClick={() => setShowInfo(true)}>i</button>
        <RoomInfoModal
          roomState={roomState}
          open={showInfo}
          onClose={() => setShowInfo(false)}
          className="room-info-modal"
        />

        <h2 className="title" style={{ fontSize: 28, marginBottom: 24 }}>Rock Paper Scissors</h2>

        {!gameResult && (
          <>
            <div className="vs-screen">
              <div className="vs-player">
                <div className="vs-player-name">{name1}</div>
                <div className="vs-hidden">{choices[1] ? "✓" : "?"}</div>
                <div className="vs-player-choice-label">{choices[1] ? "Chosen" : "Choosing..."}</div>
              </div>
              <div className="vs-divider">VS</div>
              <div className="vs-player">
                <div className="vs-player-name">{name2}</div>
                <div className="vs-hidden">{choices[2] ? "✓" : "?"}</div>
                <div className="vs-player-choice-label">{choices[2] ? "Chosen" : "Choosing..."}</div>
              </div>
            </div>
            {waitingCount > 0 && (
              <div className="vs-waiting">
                Waiting for {waitingCount} player{waitingCount > 1 ? "s" : ""} to choose...
              </div>
            )}
          </>
        )}

        {gameResult && <RPSResult result={gameResult} playerNames={playerNames} />}
      </div>
    );
  }

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

      <div style={{ marginBottom: 24, textAlign: "center" }}>
        {roomState.players.map((slot) => {
          const url = buildPlayerUrl(roomState.roomId, slot.id);
          return (
            <div key={slot.id} style={{ marginBottom: 8, fontSize: 13 }}>
              <span className="text-secondary">Player {slot.id}: </span>
              <a href={url} style={{ wordBreak: "break-all" }}>{url}</a>
            </div>
          );
        })}
      </div>

      <div className="lobby-ready-count">
        {derived.readyCount} / {roomState.config.maxPlayers} players ready
      </div>

      <div className="lobby-grid">
        {roomState.players.map((slot) => (
          <div
            key={slot.id}
            className={`slot ${slot.status === "joining" ? "slot--joining" : ""} ${slot.status === "ready" ? "slot--ready" : ""}`}
          >
            <div className="slot-label">Player {slot.id}</div>
            {slot.status === "empty" && (
              <div className="text-secondary" style={{ fontSize: 14 }}>Waiting...</div>
            )}
            {slot.status === "joining" && (
              <div className="text-accent" style={{ fontSize: 14 }}>Joining...</div>
            )}
            {slot.status === "ready" && (
              <div className="slot-status-ready">Ready</div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn"
        onClick={() => updateRoom(startGame(roomState))}
        disabled={!derived.canStart}
        style={{ marginTop: 16 }}
      >
        Start Game
      </button>
    </div>
  );
}
```

Note: This page no longer uses the library's `Lobby` component and instead builds its own lobby UI using library primitives (`useRoomState`, `RoomQRCode`, `buildPlayerUrl`, `RoomInfoModal`). This is intentional — the example needs full control of the layout and styling to achieve the dark theme versus screen flow. The library `Lobby` component is still available for consumers who want the default look.

- [ ] **Step 2: Verify the example type-checks**

Run: `cd example && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add example/src/pages/LobbyPage.tsx
git commit -m "feat(example): restyle LobbyPage with versus screen and room info modal"
```

---

### Task 9: Restyle PlayerPage with dark theme and room info modal

**Files:**
- Modify: `example/src/pages/PlayerPage.tsx`

- [ ] **Step 1: Replace `example/src/pages/PlayerPage.tsx`**

```tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { joinPlayer, RoomInfoModal } from "react-gameroom";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";
import { NameInput } from "../components/NameInput";
import { RPSPicker } from "../components/RPSPicker";
import { RPSResult } from "../components/RPSResult";
import { db } from "../firebase";

export function PlayerPage() {
  const { roomId, playerId: playerIdStr } = useParams<{
    roomId: string;
    playerId: string;
  }>();
  const playerId = Number(playerIdStr);
  const { roomState, loading, error, updateRoom } = useFirebaseRoom(roomId);

  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{
    winner: number;
    p1Choice: string;
    p2Choice: string;
  } | null>(null);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const myChoiceRef = ref(db, `rooms/${roomId}/game/choices/${playerId}`);
    const unsub1 = onValue(myChoiceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setMyChoice(val);
    });

    const resultRef = ref(db, `rooms/${roomId}/game/result`);
    const unsub2 = onValue(resultRef, (snapshot) => {
      setGameResult(snapshot.val());
    });

    const namesRef = ref(db, `rooms/${roomId}/playerNames`);
    const unsub3 = onValue(namesRef, (snapshot) => {
      setPlayerNames(snapshot.val() || {});
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [roomId, playerId]);

  if (loading) return <div className="page"><div className="text-secondary">Loading...</div></div>;
  if (error || !roomState) return <div className="page"><div className="text-error">Room not found.</div></div>;

  const slot = roomState.players.find((p) => p.id === playerId);
  if (!slot) return <div className="page"><div className="text-error">Invalid player slot.</div></div>;

  async function handleNameSaved() {
    if (!roomState) return;
    await updateRoom(joinPlayer(roomState, playerId));
  }

  async function handlePick(choice: "rock" | "paper" | "scissors") {
    setMyChoice(choice);
    await set(ref(db, `rooms/${roomId}/game/choices/${playerId}`), choice);
  }

  // Game started — show RPS UI
  if (roomState.status === "started") {
    return (
      <div className="page">
        <button type="button" className="info-btn" onClick={() => setShowInfo(true)}>i</button>
        <RoomInfoModal
          roomState={roomState}
          open={showInfo}
          onClose={() => setShowInfo(false)}
          className="room-info-modal"
        />

        <h2 className="title" style={{ fontSize: 24, marginBottom: 8 }}>Rock Paper Scissors</h2>
        <div className="player-header">
          {playerNames[playerId] || `Player ${playerId}`}
        </div>

        {!myChoice && (
          <div style={{ textAlign: "center" }}>
            <p className="text-secondary" style={{ marginBottom: 16 }}>Choose your move:</p>
            <RPSPicker onPick={handlePick} disabled={false} />
          </div>
        )}

        {myChoice && !gameResult && (
          <div className="text-secondary" style={{ textAlign: "center", marginTop: 16 }}>
            You chose <span className="text-accent" style={{ fontWeight: 700 }}>{myChoice}</span>. Waiting for opponent...
          </div>
        )}

        {gameResult && <RPSResult result={gameResult} playerNames={playerNames} />}
      </div>
    );
  }

  // Lobby — show name input / waiting state
  return (
    <div className="page">
      <div className="player-header">Room {roomState.roomId} · Player {playerId}</div>

      {slot.status === "empty" && (
        <NameInput roomId={roomId!} playerId={playerId} onNameSaved={handleNameSaved} />
      )}

      {slot.status === "ready" && (
        <>
          <div className="text-secondary" style={{ marginBottom: 12 }}>
            Playing as: <span className="text-accent">{playerNames[playerId] || `Player ${playerId}`}</span>
          </div>
          <div className="slot-status-ready" style={{ fontSize: 24 }}>
            Ready!
          </div>
          <div className="text-secondary" style={{ marginTop: 8 }}>
            Waiting for others...
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the example type-checks**

Run: `cd example && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add example/src/pages/PlayerPage.tsx
git commit -m "feat(example): restyle PlayerPage with dark theme and room info modal"
```

---

### Task 10: Update README to document RoomInfoModal

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add RoomInfoModal section to README.md**

Add after the `<JoinGame>` component section (after line 184 in the current README) and before the `### Utils` section:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add RoomInfoModal to README component reference"
```

---

### Task 11: Verify everything builds and type-checks

- [ ] **Step 1: Type-check the library**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 2: Build the library**

Run: `npm run build`
Expected: successful build with CJS/ESM/types in `dist/`

- [ ] **Step 3: Type-check the example**

Run: `cd example && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Start the example dev server and visually verify**

Run: `cd example && npm run dev -- --host`

Test the following in a browser:
1. HomePage — dark background, title with emoji, two glowing buttons
2. Click "Join Game" — dark themed code input, back link works
3. Go back, click "New Game" — lobby shows with room badge, QR code on white background, player URLs, slot cards, disabled start button
4. Open a player URL in another tab — dark themed player page, name input, ready state
5. Start the game — host sees versus screen with "VS", player sees emoji picker
6. Both pick — result announcement shows on both views
7. Click "i" button on game-started views — room info modal opens with QR code and links, backdrop click dismisses

- [ ] **Step 5: Final commit if any adjustments were needed**

```bash
git add -A
git commit -m "fix: adjustments from visual verification"
```
