# Fullscreen Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `useFullscreen()` hook and `<FullscreenToggle />` button so consumers (Krimi, Unmatched) can add a host-side fullscreen toggle without rewiring the Fullscreen API in each app.

**Architecture:** Hook owns Fullscreen API access and `fullscreenchange` subscription, exposes `{ isFullscreen, isSupported, toggle }`. Component is a thin label-only button on top of the hook, mirroring the `useRoomState` / `StartGameButton` precedent. No external deps.

**Tech Stack:** React 17+, TypeScript (strict), tsup. No test runner is configured for this project — verification is `npm run typecheck`, `npm run build`, and manual checks in the `example/` app.

**Spec:** `docs/superpowers/specs/2026-04-21-fullscreen-helper-design.md`

---

## File Structure

| Path | Purpose |
|------|---------|
| `src/hooks/useFullscreen.ts` (new) | Hook implementation + return type |
| `src/components/FullscreenToggle.tsx` (new) | Button component, props, labels |
| `src/index.ts` (modify) | Add exports |
| `example/src/pages/LobbyPage.tsx` (modify) | Wire toggle in for manual verification |
| `README.md` (modify) | Add to "What's Included" table |
| `example/src/docs/ApiPage.tsx` (modify) | Add hook + component sections |
| `llms.txt` (modify) | Add hook + component to AI-readable API summary |

---

### Task 1: `useFullscreen` hook

**Files:**
- Create: `src/hooks/useFullscreen.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useCallback, useEffect, useState } from "react";

/** Return value of `useFullscreen`. */
export interface UseFullscreenResult {
  /** True when the page is currently in fullscreen. Stays in sync with browser ESC / UI exits. */
  isFullscreen: boolean;
  /** False on platforms without the Fullscreen API (e.g. iPhone Safari) and during SSR. */
  isSupported: boolean;
  /** Toggles fullscreen on `document.documentElement`. No-op when unsupported. */
  toggle: () => void;
}

/**
 * React hook that exposes the Fullscreen API for the whole page.
 * Subscribes to `fullscreenchange` so `isFullscreen` reflects ESC and browser-UI exits.
 * @example
 * const { isFullscreen, isSupported, toggle } = useFullscreen();
 * if (!isSupported) return null;
 * return <button onClick={toggle}>{isFullscreen ? "Exit" : "Enter"} fullscreen</button>;
 */
export function useFullscreen(): UseFullscreenResult {
  const isSupported =
    typeof document !== "undefined" && document.fullscreenEnabled === true;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== "undefined" && document.fullscreenElement !== null,
  );

  useEffect(() => {
    if (!isSupported) return;
    const handler = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [isSupported]);

  const toggle = useCallback(() => {
    if (!isSupported) return;
    if (document.fullscreenElement === null) {
      // Promise rejects without a user gesture or when permission is denied.
      // Nothing useful to do with the error — consumers can't recover from it.
      void document.documentElement.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  }, [isSupported]);

  return { isFullscreen, isSupported, toggle };
}
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: PASS with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFullscreen.ts
git commit -m "feat: add useFullscreen hook"
```

---

### Task 2: `<FullscreenToggle />` component

**Files:**
- Create: `src/components/FullscreenToggle.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React from "react";
import { useFullscreen } from "../hooks/useFullscreen";

/**
 * Customizable labels for FullscreenToggle text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface FullscreenToggleLabels {
  /** Button text when not fullscreen (default: "Fullscreen"). */
  enter?: string;
  /** Button text when fullscreen (default: "Exit fullscreen"). */
  exit?: string;
}

const defaultLabels: Required<FullscreenToggleLabels> = {
  enter: "Fullscreen",
  exit: "Exit fullscreen",
};

export interface FullscreenToggleProps {
  /** CSS class applied to the button element. */
  className?: string;
  /** Customizable button text for i18n. */
  labels?: FullscreenToggleLabels;
  /**
   * When true (default), the component renders nothing on platforms without
   * the Fullscreen API (e.g. iPhone Safari). Set false to keep the button
   * mounted as a disabled placeholder for layout consistency.
   */
  hideWhenUnsupported?: boolean;
}

/**
 * A button that toggles page fullscreen via the Fullscreen API.
 * Built on `useFullscreen`. Hidden by default when the API is unavailable.
 * @example
 * <FullscreenToggle className="btn" />
 */
export function FullscreenToggle({
  className,
  labels: labelsProp,
  hideWhenUnsupported = true,
}: FullscreenToggleProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const { isFullscreen, isSupported, toggle } = useFullscreen();

  if (!isSupported && hideWhenUnsupported) return null;

  return (
    <button
      type="button"
      className={className}
      disabled={!isSupported}
      onClick={toggle}
    >
      {isFullscreen ? labels.exit : labels.enter}
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: PASS with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FullscreenToggle.tsx
git commit -m "feat: add FullscreenToggle component"
```

---

### Task 3: Add exports to `src/index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add hook export**

Insert after the existing `useRoomState` export block (around the "Hooks" section):

```ts
export { useFullscreen } from "./hooks/useFullscreen";
export type { UseFullscreenResult } from "./hooks/useFullscreen";
```

- [ ] **Step 2: Add component export**

The existing `// Components` block is not alphabetic (it ends with `HostDeviceWarningModal` after `RoomInfoModal`). Append the new exports at the end of that block, immediately before the `// Utils` comment:

```ts
export { FullscreenToggle } from "./components/FullscreenToggle";
export type {
  FullscreenToggleProps,
  FullscreenToggleLabels,
} from "./components/FullscreenToggle";
```

- [ ] **Step 3: Type-check and build**

Run: `npm run typecheck && npm run build`
Expected: both PASS. Verify `dist/index.d.ts` contains `FullscreenToggle`, `useFullscreen`, `UseFullscreenResult`, `FullscreenToggleProps`, `FullscreenToggleLabels`.

Run: `grep -E "FullscreenToggle|useFullscreen|UseFullscreenResult" dist/index.d.ts`
Expected: matches for each symbol.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: export useFullscreen and FullscreenToggle from package root"
```

---

### Task 4: Wire `<FullscreenToggle />` into the example LobbyPage for manual verification

**Files:**
- Modify: `example/src/pages/LobbyPage.tsx`

The `example/` app is the project's manual verification surface. Drop the toggle into the lobby page so the next steps can verify behavior in a real browser.

- [ ] **Step 1: Add import**

Update the import from `react-gameroom` near the top of the file to include `FullscreenToggle`:

```tsx
import {
  useRoomState,
  PlayerSlotsGrid,
  RoomQRCode,
  RoomInfoModal,
  StartGameButton,
  FullscreenToggle,
  buildRoomUrl,
  buildPlayerUrl,
} from "react-gameroom";
```

- [ ] **Step 2: Render the button on the lobby page**

Locate the JSX in `LobbyPage` where `StartGameButton` is rendered. Add `<FullscreenToggle />` adjacent to it (same container/row). Exact placement is not load-bearing — pick the spot that's easiest to click during manual verification. Example:

```tsx
<FullscreenToggle />
<StartGameButton roomState={roomState} onStart={updateRoom} />
```

- [ ] **Step 3: Run the example app**

Run (in a separate terminal — do NOT run in background here, just instruct the engineer):

```bash
cd example && npm run dev
```

Open the printed URL, navigate to `/play`, create a room, and reach the lobby page.

- [ ] **Step 4: Manual verification — happy path (desktop browser)**

In Chrome or Firefox on desktop:

1. Click the "Fullscreen" button → page enters fullscreen, button text changes to "Exit fullscreen".
2. Click again → page exits fullscreen, text reverts to "Fullscreen".
3. Enter fullscreen, then press ESC → button text reverts to "Fullscreen" without a click (confirms the `fullscreenchange` listener is wired).

If any of these fail, debug before proceeding.

- [ ] **Step 5: Manual verification — unsupported platform**

If you have access to an iPhone (or Safari with Develop → Responsive Design Mode set to iPhone), open the lobby URL on it and confirm the FullscreenToggle button is **not rendered**. If you don't have access, document this as deferred verification in the commit and move on — the `hideWhenUnsupported` default and `isSupported` derivation are simple enough to trust without an iPhone in hand.

- [ ] **Step 6: Commit**

```bash
git add example/src/pages/LobbyPage.tsx
git commit -m "chore(example): wire FullscreenToggle into LobbyPage"
```

---

### Task 5: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the "What's Included" table**

Locate the `## What's Included` table (around line 43). Update two rows:

Replace the **Components** row's `Exports` cell with:

```
`PlayerSlotsGrid`, `PlayerSlotView`, `PlayerScreen`, `RoomQRCode`, `JoinGame`, `RoomInfoModal`, `HostDeviceWarningModal`, `StartGameButton`, `FullscreenToggle`
```

Replace the **Hook** row label with **Hooks** and update the `Exports` cell to:

```
`useRoomState` — derived state with `canStart`, `readyCount`, `readyPlayers`, `emptySlots`, `activePlayers`, `playerNames`. `useFullscreen` — `{ isFullscreen, isSupported, toggle }` for page-level fullscreen.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(readme): list useFullscreen and FullscreenToggle"
```

---

### Task 6: Update example docs site (`ApiPage`) and `llms.txt`

**Files:**
- Modify: `example/src/docs/ApiPage.tsx`
- Modify: `llms.txt`

Project convention: the docs site (`example/src/docs/`) and `llms.txt` must stay in sync with the README and the public API.

- [ ] **Step 1: Add hook section to `ApiPage.tsx`**

Find the existing `useRoomState` documentation section in `example/src/docs/ApiPage.tsx`. Immediately after it, add a new `useFullscreen` section using the same heading and `<CodeBlock>` patterns as the surrounding hook documentation. Use this content:

```tsx
<h3>useFullscreen()</h3>
<p>
  React hook for the page-level Fullscreen API. Subscribes to <code>fullscreenchange</code>{" "}
  so <code>isFullscreen</code> stays in sync when the user exits with ESC or via the browser UI.
  <code>isSupported</code> is <code>false</code> on platforms without the Fullscreen API
  (e.g. iPhone Safari) and during SSR.
</p>
<CodeBlock language="ts">{`function useFullscreen(): {
  isFullscreen: boolean;
  isSupported: boolean;
  toggle: () => void;
}`}</CodeBlock>
```

- [ ] **Step 2: Add component section to `ApiPage.tsx`**

In the same file, find the existing `StartGameButton` component documentation. Immediately after it, add a `FullscreenToggle` section using the same heading and `<CodeBlock>` patterns. Use this content:

```tsx
<h3>FullscreenToggle</h3>
<p>
  Drop-in button that toggles page fullscreen via <code>useFullscreen</code>. Label-only
  (no icons) for parity with <code>StartGameButton</code>. Hidden by default on platforms
  without the Fullscreen API.
</p>
<CodeBlock language="tsx">{`<FullscreenToggle
  className="btn"
  labels={{ enter: "Fullscreen", exit: "Exit fullscreen" }}
  hideWhenUnsupported // default true
/>`}</CodeBlock>
<CodeBlock language="ts">{`interface FullscreenToggleProps {
  className?: string;
  labels?: { enter?: string; exit?: string };
  hideWhenUnsupported?: boolean; // default: true
}`}</CodeBlock>
```

- [ ] **Step 3: Update `llms.txt`**

Open `llms.txt`. Around line 85, after the `useRoomState(roomState: RoomState): RoomDerivedState` line, insert a new line documenting the hook in the same compact style:

```
useFullscreen(): { isFullscreen: boolean; isSupported: boolean; toggle: () => void }
```

Find the line around 142 that describes `StartGameButton`. After that paragraph, add a sibling paragraph for `FullscreenToggle`:

```
FullscreenToggle: a button that toggles page fullscreen via the Fullscreen API.
Built on useFullscreen. Returns null when the API is unsupported (e.g. iPhone)
unless hideWhenUnsupported={false} is passed. Label-only — no icons shipped.
```

Update the `Components (PlayerSlotView, PlayerSlotsGrid, PlayerScreen, StartGameButton, RoomInfoModal) accept` line at ~147 to include `FullscreenToggle` in the parenthetical list.

- [ ] **Step 4: Verify the docs site builds and renders**

Run:

```bash
cd example && npm run dev
```

Open the printed URL, navigate to `/api`, scroll to the new `useFullscreen` and `FullscreenToggle` sections, and confirm they render without console errors.

- [ ] **Step 5: Commit**

```bash
git add example/src/docs/ApiPage.tsx llms.txt
git commit -m "docs: document useFullscreen and FullscreenToggle"
```

---

### Task 7: Final verification

- [ ] **Step 1: Re-run typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both PASS. No new warnings.

- [ ] **Step 2: Confirm exports**

Run: `grep -E "FullscreenToggle|useFullscreen|UseFullscreenResult|FullscreenToggleProps|FullscreenToggleLabels" dist/index.d.ts`
Expected: matches for all five symbols.

- [ ] **Step 3: Confirm git history is clean**

Run: `git log --oneline -10`
Expected: commits from Tasks 1–6 present, working tree clean (`git status` reports nothing to commit).
