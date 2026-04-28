# PlayerEntryScreen + RoomInfoModal.qrUrl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `PlayerEntryScreen` so consumers can drop one component on `/room/:code/player` to handle the form / seat-grid / lobby-full states; and add an optional `qrUrl?` override to `RoomInfoModal` for consumers that need to point the QR code at a custom URL.

**Architecture:** `PlayerEntryScreen` is a stateless presentational component driven by `roomState`. It computes `findFirstEmptySlot` internally to resolve the slot, then defers the actual state update to a consumer-supplied `onJoin(name, slotId)` callback — same "stateless, prop-driven" pattern as every other component in this lib. Three render branches (form / lobby-full / seat-link grid), each replaceable via a render prop. `RoomInfoModal` change is a one-prop additive override.

**Tech Stack:** React 17+, TypeScript (strict), tsup. No test runner is configured for this project — verification is `npm run typecheck`, `npm run build`, and manual checks in the `example/` app.

**Spec:** `docs/superpowers/specs/2026-04-28-player-entry-screen-design.md`

---

## File Structure

| Path | Purpose |
|------|---------|
| `src/components/PlayerEntryScreen.tsx` (new) | Component, props, labels, default UI for all three branches |
| `src/components/RoomInfoModal.tsx` (modify) | Add `qrUrl?` prop, use as fallback to existing derivation |
| `src/index.ts` (modify) | Export `PlayerEntryScreen`, `PlayerEntryScreenProps`, `PlayerEntryScreenLabels` |
| `README.md` (modify) | Add `PlayerEntryScreen` to "What's Included" + brief mention of `qrUrl` |
| `example/src/docs/ApiPage.tsx` (modify) | Add `<PlayerEntryScreen>` API entry; add `qrUrl` to `RoomInfoModal` entry |
| `example/src/docs/GuidePage.tsx` (modify) | Mention `PlayerEntryScreen` alongside `JoinGame`/`RoomInfoModal` |
| `example/src/docs/DocsHome.tsx` (modify) | Add `PlayerEntryScreen` to component table |
| `example/src/docs/ExamplesPage.tsx` (modify) | Add to component list / route mention if appropriate |
| `llms.txt` (modify) | Add `PlayerEntryScreen` to AI-readable component summary |
| `example/src/pages/PlayerEntryPage.tsx` (new) | Demo page wiring `PlayerEntryScreen` into the example app for smoke testing |
| `example/src/App.tsx` (modify) | Add the new `/play/room/:roomId/player` route |

---

### Task 1: Add `qrUrl?` prop to `RoomInfoModal`

**Files:**
- Modify: `src/components/RoomInfoModal.tsx`

- [ ] **Step 1: Add `qrUrl?` to `RoomInfoModalProps`**

In `src/components/RoomInfoModal.tsx`, replace the existing `RoomInfoModalProps` interface (around lines 34-45) with:

```ts
export interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
  closeButtonClassName?: string;
  linkClassName?: string;
  /** Optional base path for URL generation (e.g., "/app"). */
  basePath?: string;
  /**
   * Override the QR-encoded URL. When omitted, derived from roomState.status + basePath
   * (lobby → buildJoinUrl, started → buildRejoinUrl).
   * Only affects the QR code; the link list still derives /room/{id}/player/{n} URLs internally.
   */
  qrUrl?: string;
  /** Custom labels for modal text. */
  labels?: RoomInfoModalLabels;
}
```

- [ ] **Step 2: Destructure `qrUrl` and use it as a fallback**

In the same file, replace the function signature and the QR derivation. Find the existing function declaration:

```ts
export function RoomInfoModal({ roomState, open, onClose, className, closeButtonClassName, linkClassName, basePath, labels: labelsProp }: RoomInfoModalProps) {
```

Replace with:

```ts
export function RoomInfoModal({ roomState, open, onClose, className, closeButtonClassName, linkClassName, basePath, qrUrl, labels: labelsProp }: RoomInfoModalProps) {
```

Then find the existing derivation:

```ts
  const qrUrl = isStarted
    ? buildRejoinUrl(roomState.roomId, basePath)
    : buildJoinUrl(roomState.roomId, basePath);
```

Replace with:

```ts
  const derivedQrUrl = isStarted
    ? buildRejoinUrl(roomState.roomId, basePath)
    : buildJoinUrl(roomState.roomId, basePath);
  const finalQrUrl = qrUrl ?? derivedQrUrl;
```

Then find the `<RoomQRCode>` JSX usage:

```tsx
        <RoomQRCode roomId={roomState.roomId} url={qrUrl} size={160} />
```

Replace with:

```tsx
        <RoomQRCode roomId={roomState.roomId} url={finalQrUrl} size={160} />
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: PASS with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/RoomInfoModal.tsx
git commit -m "feat(RoomInfoModal): add optional qrUrl prop to override the auto-derived QR URL"
```

---

### Task 2: Create `PlayerEntryScreen` component

**Files:**
- Create: `src/components/PlayerEntryScreen.tsx`

- [ ] **Step 1: Write the full component**

Create `src/components/PlayerEntryScreen.tsx` with the following content:

```tsx
import React, { useState } from "react";
import type { RoomState } from "../types/room";
import { findFirstEmptySlot } from "../helpers/roomHelpers";
import { buildPlayerUrl } from "../utils/roomUtils";

/**
 * Customizable labels for PlayerEntryScreen text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface PlayerEntryScreenLabels {
  /** Heading on the form (default: "Join the game"). */
  formHeading?: string;
  /** Name input label (default: "Your name"). */
  nameLabel?: string;
  /** Name input placeholder (default: "Enter your name"). */
  namePlaceholder?: string;
  /** Submit button text (default: "Join"). */
  submit?: string;
  /** Submit button text while submitting (default: "Joining…"). */
  submitting?: string;
  /** Heading on the seat-link grid (default: "Rejoin your seat"). */
  rejoinHeading?: string;
  /** Suffix after each player name in the link list (default: "Rejoin"). */
  rejoinLink?: string;
  /** Aria-label prefix for seat links (default: "Rejoin link for"). */
  rejoinLinkAria?: string;
  /** Lobby-full message (default: "Lobby is full — game starting soon"). */
  lobbyFull?: string;
}

const defaultLabels: Required<PlayerEntryScreenLabels> = {
  formHeading: "Join the game",
  nameLabel: "Your name",
  namePlaceholder: "Enter your name",
  submit: "Join",
  submitting: "Joining…",
  rejoinHeading: "Rejoin your seat",
  rejoinLink: "Rejoin",
  rejoinLinkAria: "Rejoin link for",
  lobbyFull: "Lobby is full — game starting soon",
};

export interface PlayerEntryScreenProps {
  roomState: RoomState;
  /**
   * Called when the player submits the form.
   * `slotId` is computed via `findFirstEmptySlot(roomState.players)`.
   * Consumer is responsible for calling `setPlayerJoining` / `joinPlayer` and persisting.
   */
  onJoin: (name: string, slotId: number) => void | Promise<void>;

  /**
   * Replace the entire form half. Receives a `submit` helper already wired to the
   * resolved slotId, plus `isSubmitting` so custom forms can disable themselves
   * during the in-flight call. Only invoked when the form branch is selected
   * (lobby + at least one empty slot).
   */
  renderForm?: (helpers: {
    submit: (name: string) => void | Promise<void>;
    isSubmitting: boolean;
  }) => React.ReactNode;
  /** Replace the started/seat-grid half. Only invoked when status === "started". */
  renderStarted?: () => React.ReactNode;
  /** Replace the lobby-full message. Only invoked when status === "lobby" and no empty slot exists. */
  renderFull?: () => React.ReactNode;

  /** Optional path prefix for seat links (e.g., "/app"). */
  basePath?: string;

  className?: string;
  formClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  linkClassName?: string;

  labels?: PlayerEntryScreenLabels;
}

/**
 * Player landing screen for the `/room/{id}/player` route.
 * Renders one of three branches based on `roomState`:
 *   - lobby + empty slot → name form (auto-resolves to first empty slot)
 *   - lobby + no empty slot → "lobby full" message
 *   - started → seat-link grid (links to /room/{id}/player/{n} for filled slots)
 *
 * Each branch can be replaced via a render prop. The form's submit handler stays
 * inside the component when overridden — custom forms call the supplied `submit(name)`
 * helper to drive the same async/disabled flow.
 *
 * @example
 * <PlayerEntryScreen
 *   roomState={room}
 *   onJoin={async (name, slotId) => {
 *     await persist(joinPlayer(room, slotId, name));
 *   }}
 * />
 */
export function PlayerEntryScreen({
  roomState,
  onJoin,
  renderForm,
  renderStarted,
  renderFull,
  basePath,
  className,
  formClassName,
  labelClassName,
  inputClassName,
  buttonClassName,
  linkClassName,
  labels: labelsProp,
}: PlayerEntryScreenProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStarted = roomState.status === "started";
  const emptySlot = isStarted ? null : findFirstEmptySlot(roomState.players);

  async function submit(submittedName: string) {
    if (!emptySlot) return;
    const trimmed = submittedName.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      await onJoin(trimmed, emptySlot.id);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(name);
  }

  const canSubmit = name.trim().length > 0 && !isSubmitting && !!emptySlot;

  if (isStarted) {
    if (renderStarted) {
      return <div className={className} data-player-entry-started="">{renderStarted()}</div>;
    }
    const filledSlots = roomState.players.filter((p) => p.status !== "empty");
    return (
      <div className={className} data-player-entry-started="">
        <h2>{labels.rejoinHeading}</h2>
        <div data-player-entry-links="">
          {filledSlots.map((slot) => {
            const url = buildPlayerUrl(roomState.roomId, slot.id, basePath);
            const label = slot.name || `Player ${slot.id}`;
            return (
              <a
                key={slot.id}
                href={url}
                className={linkClassName}
                aria-label={`${labels.rejoinLinkAria} ${label}`}
              >
                {label} — {labels.rejoinLink}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (!emptySlot) {
    if (renderFull) {
      return <div className={className} data-player-entry-full="">{renderFull()}</div>;
    }
    return (
      <div className={className} data-player-entry-full="">
        <div role="status" aria-live="polite">{labels.lobbyFull}</div>
      </div>
    );
  }

  if (renderForm) {
    return (
      <div className={className} data-player-entry-form="">
        {renderForm({ submit, isSubmitting })}
      </div>
    );
  }

  return (
    <div className={className} data-player-entry-form="">
      <h2>{labels.formHeading}</h2>
      <form className={formClassName} onSubmit={handleFormSubmit}>
        <label htmlFor="player-entry-name" className={labelClassName}>{labels.nameLabel}</label>
        <input
          id="player-entry-name"
          className={inputClassName}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePlaceholder}
          aria-required="true"
          maxLength={40}
          disabled={isSubmitting}
        />
        <button
          className={buttonClassName}
          type="submit"
          disabled={!canSubmit}
          data-submitting={isSubmitting || undefined}
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: PASS with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerEntryScreen.tsx
git commit -m "feat: add PlayerEntryScreen component"
```

---

### Task 3: Export `PlayerEntryScreen` from `src/index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add the exports**

In `src/index.ts`, find the existing `JoinGame` export block:

```ts
export { JoinGame } from "./components/JoinGame";
export type { JoinGameProps, JoinGameLabels } from "./components/JoinGame";
```

Insert immediately after it:

```ts
export { PlayerEntryScreen } from "./components/PlayerEntryScreen";
export type { PlayerEntryScreenProps, PlayerEntryScreenLabels } from "./components/PlayerEntryScreen";
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Build to confirm bundle output is clean**

Run: `npm run build`
Expected: tsup completes successfully, `dist/index.d.ts` contains `PlayerEntryScreen`, `PlayerEntryScreenProps`, `PlayerEntryScreenLabels`.

Verify with:
```bash
grep -E "PlayerEntryScreen|qrUrl" dist/index.d.ts | head -10
```
Expected: Multiple matches for `PlayerEntryScreen` types and `qrUrl?: string` on `RoomInfoModalProps`.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: export PlayerEntryScreen from src/index.ts"
```

---

### Task 4: Update `README.md`

**Context:** The README is intentionally terse — it has no per-component sections. The "What's Included" table on line 47 lists components by name; component-level docs live on the docs site (covered in Task 5). The only README change is adding `PlayerEntryScreen` to the components-list row.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add `PlayerEntryScreen` to the components list**

Find this exact line in `README.md` (line 47):

```md
| **Components** | `PlayerSlotsGrid`, `PlayerSlotView`, `PlayerScreen`, `RoomQRCode`, `JoinGame`, `RoomInfoModal`, `HostDeviceWarningModal`, `StartGameButton`, `FullscreenToggle` |
```

Replace with (added `PlayerEntryScreen` immediately after `PlayerScreen`):

```md
| **Components** | `PlayerSlotsGrid`, `PlayerSlotView`, `PlayerScreen`, `PlayerEntryScreen`, `RoomQRCode`, `JoinGame`, `RoomInfoModal`, `HostDeviceWarningModal`, `StartGameButton`, `FullscreenToggle` |
```

- [ ] **Step 2: Sanity-check**

Confirm the table row is still on a single line and the table renders cleanly:

```bash
sed -n '43,51p' README.md
```
Expected: the table prints with all four rows intact.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): list PlayerEntryScreen in What's Included"
```

---

### Task 5: Update the docs site (`example/src/docs/`)

**Files:**
- Modify: `example/src/docs/ApiPage.tsx`
- Modify: `example/src/docs/GuidePage.tsx`
- Modify: `example/src/docs/DocsHome.tsx`
- Modify: `example/src/docs/ExamplesPage.tsx`

- [ ] **Step 1: Add a `<PlayerEntryScreen>` section to `ApiPage.tsx`**

In `example/src/docs/ApiPage.tsx`, find the `<JoinGame>` section. It begins around line 217 with `<h3>{"<JoinGame>"}</h3>`. After the entire `<JoinGame>` section ends (before the next `<h3>`), insert a new `<PlayerEntryScreen>` section. Match the visual / structural style of the surrounding sections — heading, short description paragraph, one or two `<CodeBlock>` examples.

Example block to insert (adjust whitespace to match the file's indentation):

```tsx
      <h3>{"<PlayerEntryScreen>"}</h3>
      <p>
        Player landing screen for the <code>/room/{"{id}"}/player</code> route. Renders a name form
        when the lobby has space, a seat-link grid once the game has started, or a "lobby full"
        message in between.
      </p>

      <CodeBlock language="tsx">{`<PlayerEntryScreen
  roomState={room}
  onJoin={async (name, slotId) => {
    await persist(joinPlayer(room, slotId, name));
  }}
/>`}</CodeBlock>

      <p>Each branch is replaceable via render props:</p>

      <CodeBlock language="tsx">{`<PlayerEntryScreen
  roomState={room}
  onJoin={handleJoin}
  renderForm={({ submit, isSubmitting }) => (
    <MyForm onSubmit={(name) => submit(name)} disabled={isSubmitting} />
  )}
  renderStarted={() => <MyRejoinGrid players={room.players} />}
  renderFull={() => <p>The lobby is full.</p>}
/>`}</CodeBlock>
```

- [ ] **Step 2: Add `qrUrl` to the `<RoomInfoModal>` API entry**

In `example/src/docs/ApiPage.tsx`, find the `<RoomInfoModal>` section. The section uses prose paragraphs followed by `<CodeBlock>` examples (no separate prop-table). The second `<CodeBlock>` ends around line 293 with `/>}</CodeBlock>`. Insert a new `<p>` paragraph immediately after that closing `</CodeBlock>` (and before the next `<h3>` for `<HostDeviceWarningModal>` on line 295):

```tsx
      <p>
        Pass <code>qrUrl</code> to override the auto-derived QR URL. When omitted, the QR code
        points at <code>buildJoinUrl</code> during lobby and <code>buildRejoinUrl</code> after the
        game starts. Useful when the QR should point at a custom landing page, deep link, or short URL.
      </p>
```

- [ ] **Step 3: Add `PlayerEntryScreen` to the accessibility callouts (if appropriate)**

`ApiPage.tsx` has an accessibility-callouts list (around line 373 onward) describing `RoomInfoModal`, `JoinGame`, and `PlayerScreen`. Add an entry for `PlayerEntryScreen`:

```tsx
        <li><strong>PlayerEntryScreen</strong> — visible <code>&lt;label&gt;</code> and <code>aria-required</code> on the form, <code>role="status"</code> with <code>aria-live="polite"</code> on the lobby-full message</li>
```

Insert it adjacent to the `JoinGame` entry — these are the two form-bearing components, so they belong near each other.

- [ ] **Step 4: Mention `PlayerEntryScreen` in `GuidePage.tsx`**

In `example/src/docs/GuidePage.tsx`, find this exact two-line passage (lines 67-68):

```tsx
        Use <code>JoinGame</code> for a room code entry form, and <code>RoomInfoModal</code> to
        show room info and QR codes during gameplay.
```

Replace with:

```tsx
        Use <code>JoinGame</code> for a room code entry form, <code>PlayerEntryScreen</code> for the
        per-room player landing route (<code>/room/{"{id}"}/player</code>), and <code>RoomInfoModal</code> to
        show room info and QR codes during gameplay.
```

- [ ] **Step 5: Add `PlayerEntryScreen` to the components row in `DocsHome.tsx`**

In `example/src/docs/DocsHome.tsx`, find the components row (around line 58):

```tsx
            <td><code>PlayerSlotsGrid</code>, <code>PlayerSlotView</code>, <code>PlayerScreen</code>, <code>RoomQRCode</code>, <code>JoinGame</code>, <code>RoomInfoModal</code>, <code>StartGameButton</code></td>
```

Replace with:

```tsx
            <td><code>PlayerSlotsGrid</code>, <code>PlayerSlotView</code>, <code>PlayerScreen</code>, <code>PlayerEntryScreen</code>, <code>RoomQRCode</code>, <code>JoinGame</code>, <code>RoomInfoModal</code>, <code>StartGameButton</code></td>
```

- [ ] **Step 6: Mention `PlayerEntryScreen` in `ExamplesPage.tsx`**

In `example/src/docs/ExamplesPage.tsx`, three small additions.

**(a) File-tree** — find this exact line (line 25):

```tsx
    JoinGamePage.tsx    # Room code entry form
```

Replace with (preserving the file-tree alignment and comment style):

```tsx
    JoinGamePage.tsx    # Room code entry form
    PlayerEntryPage.tsx # Auto-assign first empty slot, or rejoin grid if started
```

**(b) Routes block** — find this exact 6-line passage (lines 39-44):

```tsx
      <CodeBlock language="tsx">{`<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/join" element={<JoinGamePage />} />
  <Route path="/room/:roomId" element={<LobbyPage />} />
  <Route path="/room/:roomId/player/:playerId" element={<PlayerPage />} />
</Routes>`}</CodeBlock>
```

Replace with (the new route is more specific than `:playerId` only at length, but route order in this docs snippet doesn't drive matching — keep the new line above `:playerId` so it reads logically):

```tsx
      <CodeBlock language="tsx">{`<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/join" element={<JoinGamePage />} />
  <Route path="/room/:roomId" element={<LobbyPage />} />
  <Route path="/room/:roomId/player" element={<PlayerEntryPage />} />
  <Route path="/room/:roomId/player/:playerId" element={<PlayerPage />} />
</Routes>`}</CodeBlock>
```

**(c) Route-description list** — find this exact 6-line passage (lines 46-51):

```tsx
      <ul>
        <li><code>/</code> — the landing page where a host creates a game or a player chooses to join</li>
        <li><code>/join</code> — the room code entry screen</li>
        <li><code>/room/:roomId</code> — the host's lobby and game view</li>
        <li><code>/room/:roomId/player/:playerId</code> — a player's view (on their phone)</li>
      </ul>
```

Replace with:

```tsx
      <ul>
        <li><code>/</code> — the landing page where a host creates a game or a player chooses to join</li>
        <li><code>/join</code> — the room code entry screen</li>
        <li><code>/room/:roomId</code> — the host's lobby and game view</li>
        <li><code>/room/:roomId/player</code> — first-come-first-served seat-assignment landing</li>
        <li><code>/room/:roomId/player/:playerId</code> — a player's view (on their phone)</li>
      </ul>
```

- [ ] **Step 7: Type-check and visually inspect**

Run: `npm run typecheck`
Expected: PASS.

Open the four edited files and confirm each insertion is well-formed JSX (no orphan tags, no broken template literals).

- [ ] **Step 8: Commit**

```bash
git add example/src/docs/ApiPage.tsx example/src/docs/GuidePage.tsx example/src/docs/DocsHome.tsx example/src/docs/ExamplesPage.tsx
git commit -m "docs(site): document PlayerEntryScreen and RoomInfoModal qrUrl"
```

---

### Task 6: Update `llms.txt`

**Files:**
- Modify: `llms.txt`

- [ ] **Step 1: Add `PlayerEntryScreen` to the component list**

Find this exact line in `llms.txt` (line 157):

```
Components (PlayerSlotView, PlayerSlotsGrid, PlayerScreen, StartGameButton, FullscreenToggle, RoomInfoModal) accept
```

Replace with:

```
Components (PlayerSlotView, PlayerSlotsGrid, PlayerScreen, PlayerEntryScreen, StartGameButton, FullscreenToggle, RoomInfoModal) accept
```

- [ ] **Step 2: Extend the `RoomInfoModal` paragraph to mention `qrUrl`**

Find this exact 4-line passage in `llms.txt` (lines 167-170):

```
RoomInfoModal is status-aware: during lobby, QR code points to buildJoinUrl and
links say "Join". When game is started, QR points to buildRejoinUrl and links say
"Rejoin". Pass basePath prop to set URL prefix. Labels are customizable via
rejoinLink/rejoinLinkAria.
```

Replace with:

```
RoomInfoModal is status-aware: during lobby, QR code points to buildJoinUrl and
links say "Join". When game is started, QR points to buildRejoinUrl and links say
"Rejoin". Pass basePath prop to set URL prefix. Pass qrUrl to override the
auto-derived QR target with a custom URL (e.g., a short link or deep link); the
link list still uses the derived player URLs. Labels are customizable via
rejoinLink/rejoinLinkAria.
```

- [ ] **Step 3: Add a `PlayerEntryScreen` paragraph**

Append the following new paragraph immediately after the (now-modified) `RoomInfoModal` paragraph and before the existing `HostDeviceWarningModal` paragraph (which currently begins on line 172 with `HostDeviceWarningModal is a confirmation dialog…`):

```
PlayerEntryScreen is the landing component for the /room/{id}/player route. In
lobby mode with an empty slot, it renders a name form and resolves the slot via
findFirstEmptySlot, calling onJoin(name, slotId) on submit. With no empty slot,
it shows a "lobby full" message. After startGame, it renders a seat-rejoin link
grid (anchors to /room/{id}/player/{n}) for filled slots only. Each branch is
replaceable via renderForm, renderStarted, and renderFull render props; the
form's submit helper drives the same isSubmitting flow when overridden.

```

(Note the trailing blank line — keeps a one-line gap before the `HostDeviceWarningModal` paragraph, matching the spacing between other paragraphs in this file.)

- [ ] **Step 4: Commit**

```bash
git add llms.txt
git commit -m "docs(llms): document PlayerEntryScreen and RoomInfoModal qrUrl"
```

---

### Task 7: Wire `PlayerEntryScreen` into the example app for smoke testing

**Files:**
- Create: `example/src/pages/PlayerEntryPage.tsx`
- Modify: `example/src/App.tsx`

- [ ] **Step 1: Create the page**

Create `example/src/pages/PlayerEntryPage.tsx`:

```tsx
import { useNavigate, useParams } from "react-router-dom";
import { joinPlayer, PlayerEntryScreen } from "react-gameroom";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";

export function PlayerEntryPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { roomState, loading, error, updateRoom } = useFirebaseRoom(roomId);

  if (loading) return <div className="page"><div className="text-secondary">Loading...</div></div>;
  if (error || !roomState) return <div className="page"><div className="text-error">Room not found.</div></div>;

  async function handleJoin(name: string, slotId: number) {
    if (!roomState) return;
    await updateRoom(joinPlayer(roomState, slotId, name));
    navigate(`/play/room/${roomState.roomId}/player/${slotId}`);
  }

  return (
    <PlayerEntryScreen
      roomState={roomState}
      onJoin={handleJoin}
      basePath="/play"
      className="page"
      formClassName="join-form"
      inputClassName="input"
      buttonClassName="btn"
      linkClassName="room-info-link"
    />
  );
}
```

Note the `basePath="/play"` — the example app mounts the gameplay routes under `/play`, so seat links must include that prefix to resolve correctly.

- [ ] **Step 2: Register the route in `App.tsx`**

In `example/src/App.tsx`, find the existing route list (around lines 24-27):

```tsx
      <Route path="/play" element={<HomePage />} />
      <Route path="/play/join" element={<JoinGamePage />} />
      <Route path="/play/room/:roomId" element={<LobbyPage />} />
      <Route path="/play/room/:roomId/player/:playerId" element={<PlayerPage />} />
```

Add a new route immediately above the `:playerId` route, so React Router matches the more specific path first. The block becomes:

```tsx
      <Route path="/play" element={<HomePage />} />
      <Route path="/play/join" element={<JoinGamePage />} />
      <Route path="/play/room/:roomId" element={<LobbyPage />} />
      <Route path="/play/room/:roomId/player" element={<PlayerEntryPage />} />
      <Route path="/play/room/:roomId/player/:playerId" element={<PlayerPage />} />
```

Add the matching import at the top of the file. Find the existing imports for `JoinGamePage` / `PlayerPage`:

```tsx
import { JoinGamePage } from "./pages/JoinGamePage";
```

Insert near them:

```tsx
import { PlayerEntryPage } from "./pages/PlayerEntryPage";
```

(The exact line position doesn't matter as long as it's grouped with the other page imports.)

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Manual smoke test**

Run: `npm --prefix example run dev` (or whatever script the `example/package.json` exposes — confirm the script name first with `cat example/package.json | grep -A 5 scripts`).

In a browser:

1. Navigate to `/play`, create a room (use existing host flow), and copy the room ID.
2. In a different tab/incognito window, navigate to `/play/room/{ROOM_ID}/player`.
   - **Expected:** Name form heading "Join the game", input, "Join" button.
3. Submit a name.
   - **Expected:** Redirects to `/play/room/{ROOM_ID}/player/{N}` and the user is in `ready` state.
4. Repeat from step 2 in another incognito window with different names until all slots are filled.
5. Open a new incognito window, navigate to `/play/room/{ROOM_ID}/player` while the lobby is still in `lobby` status.
   - **Expected:** "Lobby is full — game starting soon" message.
6. From the host, start the game.
7. In any tab, navigate to `/play/room/{ROOM_ID}/player`.
   - **Expected:** "Rejoin your seat" heading + a list of links, one per filled player. Click one.
   - **Expected:** Lands on the per-player page with the started UI.

If any step fails, stop and debug before proceeding.

- [ ] **Step 5: Commit**

```bash
git add example/src/pages/PlayerEntryPage.tsx example/src/App.tsx
git commit -m "example: wire PlayerEntryScreen into the demo app on /room/:roomId/player"
```

---

### Task 8: Final build verification

**Files:** none modified

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: tsup produces `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts` with no errors or warnings.

- [ ] **Step 2: Verify exports landed**

Run:
```bash
grep -E "PlayerEntryScreen|qrUrl" dist/index.d.ts
```
Expected output includes:
- `class PlayerEntryScreen` or `function PlayerEntryScreen` declaration (with React.FC-like signature)
- `interface PlayerEntryScreenProps`
- `interface PlayerEntryScreenLabels`
- `qrUrl?: string` somewhere inside `interface RoomInfoModalProps`

- [ ] **Step 3: Confirm no stray work tree changes**

Run: `git status`
Expected: working tree clean.

- [ ] **Step 4 (optional): Bump version + changelog**

Out of scope for this plan. The release commit is a separate concern handled at publish time. Stop here.
