# Fullscreen helper design

## Motivation

Both Krimi and Unmatched (the two real consumers of `react-gameroom`) want a way for the host to put the bigscreen page into fullscreen — TVs, laptops driving a projector, and dedicated host displays all benefit from reclaiming the browser chrome. Each consumer would otherwise hand-roll the same Fullscreen API wrapper, including the same accessibility and `fullscreenchange` synchronization concerns. Owning this once in the library is a small but real win.

## Scope

Ship a hook + a thin convenience button, mirroring the `useRoomState` / `StartGameButton` precedent. The hook is the primitive; the button exists for the common case.

**In scope:**
- `useFullscreen()` hook
- `<FullscreenToggle />` button component
- Exports from `src/index.ts`

**Explicitly out of scope (call out and defer):**
- Vendor-prefixed Fullscreen API fallbacks (`webkitRequestFullscreen` etc.). Modern browsers don't need them; supporting Safari < 16.4 isn't a current goal.
- Keyboard shortcut. Consumers can wire one up via the hook later if they want it.
- Per-element targeting via a ref prop. Both consumers want to fullscreen the whole tab; YAGNI on a `target` prop until somebody actually needs to fullscreen a sub-element.
- Icon props on the button. The library is intentionally icon-library-free; consumers who want icon-driven fullscreen toggles use the hook directly.
- Auto-enter on game start. Browsers reject `requestFullscreen()` outside a user gesture, so this would silently fail. A user-initiated button is also the accessible default.

## API

### `useFullscreen()`

```ts
function useFullscreen(): {
  isFullscreen: boolean;
  isSupported: boolean;
  toggle: () => void;
};
```

- **`isFullscreen`** — tracks `document.fullscreenElement !== null`. Updated via a `fullscreenchange` listener so it stays in sync when the user exits with ESC or via the browser UI.
- **`isSupported`** — `typeof document !== "undefined" && document.fullscreenEnabled === true`. Returns `false` on iPhone (no Fullscreen API) and on SSR. Lets consumers hide controls instead of rendering a button that throws.
- **`toggle()`** — calls `document.documentElement.requestFullscreen()` when not fullscreen, `document.exitFullscreen()` when fullscreen. Swallows the rejected promise from `requestFullscreen()` (browsers reject outside a user gesture or when permission is denied) — there's nothing useful for the hook to do with the error, and surfacing it would force every consumer to wire up error handling for a case they can't recover from.

Target is always `document.documentElement` — see scope note above.

### `<FullscreenToggle />`

```ts
interface FullscreenToggleProps {
  className?: string;
  labels?: FullscreenToggleLabels;
  hideWhenUnsupported?: boolean; // default: true
}

interface FullscreenToggleLabels {
  enter?: string; // default: "Fullscreen"
  exit?: string;  // default: "Exit fullscreen"
}
```

- Renders a `<button type="button">` that calls `toggle()` from the hook.
- Button text swaps between `labels.enter` and `labels.exit` based on `isFullscreen`.
- When `isSupported === false` and `hideWhenUnsupported` is `true` (default), the component returns `null`. Setting `hideWhenUnsupported={false}` keeps the button visible but rendered with `disabled` — useful if consumers want a consistent layout slot regardless of platform.
- No icon props. Mirrors `StartGameButton`'s label-only API.

## File layout

Matches existing convention:

- `src/hooks/useFullscreen.ts`
- `src/components/FullscreenToggle.tsx`
- Add exports to `src/index.ts`:
  - `useFullscreen` (value)
  - `FullscreenToggle` (value)
  - `FullscreenToggleProps`, `FullscreenToggleLabels` (types)

## Documentation

Per project convention, both must be updated when this lands:

- `README.md` — add `useFullscreen` and `FullscreenToggle` to the API surface section
- `example/src/docs/` — add a docs page describing the hook + component, including the iPhone unsupported case

## Testing

No test runner is configured in this project, so testing is manual via the example app. Verify:

- Toggle enters and exits fullscreen on Chrome, Firefox, Safari (desktop)
- ESC out of fullscreen flips `isFullscreen` back to `false` (button label updates)
- On iPhone Safari, button is hidden by default
- On iPhone Safari with `hideWhenUnsupported={false}`, button renders with the `disabled` attribute and does not respond to clicks
- Custom `labels` and `className` apply correctly
