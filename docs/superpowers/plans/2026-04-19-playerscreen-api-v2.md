# PlayerScreen API v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the dead join UI from `PlayerScreen` (`onJoin` prop, default "Join Game" button, `labels.joinGame`) and add a `renderHeader` render-prop slot that unifies the default heading across all phases.

**Architecture:** Single-component refactor of `src/components/PlayerScreen.tsx`. Pull the heading out of both the `started` default branch and the lobby default pre-body, into a single `header` node computed once after the `!slot` guard. Add `renderHeader?: (roomState, slot) => ReactNode` that replaces the default heading when provided. Update doc snippets in the example app that show the removed props.

**Tech Stack:** TypeScript (strict), React 17+, tsup (library build), Vite + tsc (example build). No test runner is configured, so verification uses `npm run typecheck`, `npm run build`, and the example's `tsc && vite build`. The example resolves `react-gameroom` to `../src/index.ts` via vite alias and tsconfig `paths`, so example type-checking exercises the new API directly.

**Spec:** `docs/superpowers/specs/2026-04-19-playerscreen-api-v2-design.md`

---

## File Structure

- **Modify:** `src/components/PlayerScreen.tsx` — full rewrite of the component body; `PlayerScreenLabels` loses `joinGame`; `PlayerScreenProps` loses `onJoin`, gains `renderHeader`.
- **Modify:** `example/src/docs/ApiPage.tsx` lines 119–145 — PlayerScreen doc section. Remove the "onJoin/onReady default UI" code block, swap `labels.joinGame` for a surviving label in the i18n example, add a `renderHeader` example.
- **No change needed:**
  - `README.md` — does not reference `onJoin`, `joinGame`, or detailed PlayerScreen props.
  - `llms.txt` — the one `onJoin/href` reference (line 144) is in the context of `PlayerSlotView`, not `PlayerScreen`.
  - `example/src/pages/PlayerPage.tsx` — uses `renderStarted`/`renderEmpty`/`renderReady`; never passed `onJoin`.
  - `example/src/pages/JoinGamePage.tsx` — `onJoin` there is on `JoinGame`, a different component.
  - `example/src/docs/GuidePage.tsx` — the `onJoin` at line 49 is inside a `renderEmpty` callback, on a consumer-supplied form, not on `PlayerScreen`.

---

## Task 1: Rewrite PlayerScreen component

**Files:**
- Modify: `src/components/PlayerScreen.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/components/PlayerScreen.tsx`**

Overwrite with this exact content:

```tsx
import React from "react";
import type { PlayerSlot, RoomState } from "../types/room";

/**
 * Customizable labels for PlayerScreen default UI text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface PlayerScreenLabels {
  /** Error shown when playerId doesn't match any slot or the slot is empty (default: "Invalid player slot"). */
  invalidSlot?: string;
  /** Heading prefix before roomId (default: "Room:"). */
  roomHeading?: string;
  /** Heading prefix before playerId (default: "Player"). */
  playerHeading?: string;
  /** Status text when game has started (default: "Game Started!"). */
  gameStarted?: string;
  /** Status text while joining (default: "Joining..."). */
  joining?: string;
  /** Ready-up button text (default: "Ready Up"). */
  readyUp?: string;
  /** Status text when ready (default: "Ready! Waiting for others..."). */
  readyWaiting?: string;
}

const defaultLabels: Required<PlayerScreenLabels> = {
  invalidSlot: "Invalid player slot",
  roomHeading: "Room:",
  playerHeading: "Player",
  gameStarted: "Game Started!",
  joining: "Joining...",
  readyUp: "Ready Up",
  readyWaiting: "Ready! Waiting for others...",
};

export interface PlayerScreenProps {
  roomState: RoomState;
  playerId: number;
  onReady?: () => void;
  renderHeader?: (roomState: RoomState, slot: PlayerSlot) => React.ReactNode;
  renderStarted?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderReady?: () => React.ReactNode;
  className?: string;
  /** Custom labels for default UI text. */
  labels?: PlayerScreenLabels;
}

export function PlayerScreen({
  roomState,
  playerId,
  onReady,
  renderHeader,
  renderStarted,
  renderEmpty,
  renderReady,
  className,
  labels: labelsProp,
}: PlayerScreenProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const slot = roomState.players.find((p) => p.id === playerId);

  if (!slot) {
    return <div className={className} role="alert">{labels.invalidSlot}</div>;
  }

  const header = renderHeader ? renderHeader(roomState, slot) : (
    <>
      <h2>{labels.roomHeading} {roomState.roomId}</h2>
      <h3>{slot.name || `${labels.playerHeading} ${playerId}`}</h3>
    </>
  );

  let body: React.ReactNode;
  if (roomState.status === "started") {
    body = renderStarted ? renderStarted() : (
      <div role="status" aria-live="polite">{labels.gameStarted}</div>
    );
  } else if (slot.status === "empty") {
    body = renderEmpty ? renderEmpty() : (
      <div role="alert">{labels.invalidSlot}</div>
    );
  } else if (slot.status === "joining") {
    body = (
      <div>
        <div role="status" aria-live="polite">{labels.joining}</div>
        <button type="button" onClick={onReady}>
          {labels.readyUp}
        </button>
      </div>
    );
  } else {
    body = renderReady ? renderReady() : (
      <div role="status" aria-live="polite">{labels.readyWaiting}</div>
    );
  }

  return (
    <div className={className}>
      {header}
      {body}
    </div>
  );
}
```

What changed from the previous version:
- Removed `onJoin` from props destructuring and the interface.
- Removed the `"Join Game"` default button; empty-slot body now renders `<div role="alert">{labels.invalidSlot}</div>` (or `renderEmpty()` when supplied).
- Removed `labels.joinGame` from `PlayerScreenLabels` and `defaultLabels`.
- Added `renderHeader?: (roomState, slot) => ReactNode` and imported `PlayerSlot`.
- Pulled the heading out of the `started` branch's default content; it is now computed once as `header` above the body and rendered uniformly across all valid-slot states.
- Default heading now uses `slot.name || "${playerHeading} ${playerId}"` in every state (previously the lobby heading ignored `slot.name`). This is a strict improvement — no migration needed.
- Removed the `hasCustomLobby` flag; it no longer exists.

- [ ] **Step 2: Run the library type-check**

Run: `npm run typecheck`
Expected: exits 0 with no output. If there's a type error, fix it before proceeding (likely culprits: a stale import of `PlayerSlot` missing, or an incorrect prop name).

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerScreen.tsx
git commit -m "feat(PlayerScreen)!: add renderHeader slot; drop onJoin and default Join button

BREAKING CHANGE: removes onJoin prop, labels.joinGame, and the default
Join Game button when a slot is empty. Empty slots now render
labels.invalidSlot (or renderEmpty if supplied). Consumers should route
users through a dedicated join page that writes the joining state."
```

---

## Task 2: Update PlayerScreen docs in the example app

**Files:**
- Modify: `example/src/docs/ApiPage.tsx` lines 119–145

- [ ] **Step 1: Apply the edit**

Replace the PlayerScreen section in `example/src/docs/ApiPage.tsx`. The current block (lines 119–145) is:

```tsx
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
      <p>Customize default UI text via the <code>labels</code> prop:</p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={1}
  labels={{ joinGame: "Entrar", readyUp: "Pronto", readyWaiting: "Aguardando..." }}
/>`}</CodeBlock>
```

Replace with:

```tsx
      <h3>{"<PlayerScreen>"}</h3>
      <p>
        The individual player view (typically shown on a mobile device). Renders a header and
        a phase-specific body (lobby joining/ready or "Game Started"). Supports render props to
        replace default content for the header and each phase:
      </p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={1}
  className="my-player"
  renderHeader={(state, slot) => <AppHeader room={state.roomId} player={slot.name} />}
  renderStarted={() => <MyGameUI />}
  renderEmpty={() => <MyJoinForm />}
  renderReady={() => <MyReadyMessage />}
/>`}</CodeBlock>
      <p>
        Empty slots are treated as an error state — route players through a dedicated join
        page that writes the <code>joining</code> status before redirecting to the player URL.
        Supply <code>renderEmpty</code> for custom recovery UX.
      </p>
      <p>When render props are omitted, <code>PlayerScreen</code> renders a default heading plus a <code>Ready Up</code> button wired to <code>onReady</code>:</p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={1}
  onReady={() => {}}
/>`}</CodeBlock>
      <p>Customize default UI text via the <code>labels</code> prop:</p>
      <CodeBlock language="tsx">{`<PlayerScreen
  roomState={roomState}
  playerId={1}
  labels={{ readyUp: "Pronto", readyWaiting: "Aguardando...", gameStarted: "Começou!" }}
/>`}</CodeBlock>
```

Use the `Edit` tool with the old string being the exact block shown above (from the `<h3>{"<PlayerScreen>"}</h3>` line through the closing `/>`}</CodeBlock>` of the labels example) and the new string being the replacement block. The surrounding context (the `<PlayerSlotsGrid>` section that follows at line 147) is unchanged — do not include it in the edit.

- [ ] **Step 2: Build the example app to verify type-checking**

Run: `cd example && npm run build`
Expected: `tsc` exits 0, then `vite build` produces `dist/` without errors. Any TypeScript error here likely means the example or one of its other pages still references a removed prop — fix it, re-run, do not proceed until clean.

- [ ] **Step 3: Commit**

```bash
git add example/src/docs/ApiPage.tsx
git commit -m "docs(example): update PlayerScreen API page for v2

Replaces the onJoin/labels.joinGame snippets with a renderHeader example
and a note that empty slots are now an error state."
```

---

## Task 3: Final verification

**Files:** none modified; this task only runs commands.

- [ ] **Step 1: Library type-check**

Run: `npm run typecheck`
Expected: exits 0, no output.

- [ ] **Step 2: Library build**

Run: `npm run build`
Expected: tsup prints CJS/ESM/DTS entries without errors; `dist/index.d.ts`, `dist/index.js`, `dist/index.mjs` exist.

- [ ] **Step 3: Confirm `onJoin` is no longer a PlayerScreen prop in the emitted types**

Run: `grep -n 'onJoin' dist/index.d.ts || echo "no onJoin in d.ts"`
Expected: the only matches should be inside `PlayerSlotViewProps`, `PlayerSlotsGridProps`, and `JoinGameProps`. There should be **no** match inside the `PlayerScreenProps` block. Verify by also running:

Run: `grep -A 20 'PlayerScreenProps' dist/index.d.ts`
Expected output must include `renderHeader?` and must NOT include `onJoin?`.

- [ ] **Step 4: Example build**

Run: `cd example && npm run build`
Expected: tsc + vite build both succeed.

- [ ] **Step 5: Commit (only if there were any fixes in prior steps)**

If prior verification steps surfaced issues that required code changes, commit them with a descriptive message. If everything passed on the first try, skip this step — no commit is needed for a pure verification task.

- [ ] **Step 6: Report completion**

State clearly:
- The three tasks are complete.
- Library and example both type-check and build.
- Manual smoke-test on the example dev server (`cd example && npm run dev`) was NOT performed as part of this plan — note this as a recommended follow-up for the user, since PlayerPage renders real PlayerScreen instances and visually confirming the header + each phase body is the final check.

---

## Out of scope (do not do)

- Do not collapse the `empty → joining → ready` state machine into two states. That's explicitly deferred per the spec.
- Do not add a `joinUrl`/`joinHref` prop. Considered and rejected during brainstorming.
- Do not refactor `PlayerSlotView` or `PlayerSlotsGrid`. They also expose `onJoin` callbacks — those are unrelated to this plan and stay.
- Do not touch `README.md` or `llms.txt` unless a later verification step surfaces an outdated reference. Pre-flight grep confirmed no current references to `onJoin` or `joinGame` that apply to PlayerScreen.
