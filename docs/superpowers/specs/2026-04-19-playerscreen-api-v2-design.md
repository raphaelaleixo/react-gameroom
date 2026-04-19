# PlayerScreen API v2

**Date:** 2026-04-19
**Status:** Approved

## Background

Two real consumers (react-unmatched, Krimi) have converged on the same patterns that expose friction in the current `PlayerScreen` API:

1. **Neither consumer joins in-place from the player URL.** Both have a dedicated join route that handles name entry and redirects to the player URL only after the slot is in `joining` state. The library's default empty-slot UI — a "Join Game" button wired to `onJoin` — is dead code.
2. **Both consumers reimplement the same header block in both `renderReady` and `renderStarted`.** The library renders a default `<h2>Room</h2><h3>Player</h3>` only when the consumer uses defaults; once either phase is overridden, consumers must re-add the header in each render prop, producing duplication.

This spec removes the dead join UI and adds a `renderHeader` slot that renders once above all phases.

## API changes

### Removed

- `onJoin?: () => void` prop
- The default "Join Game" `<button>` rendered when `slot.status === "empty"`
- `labels.joinGame` field from `PlayerScreenLabels`

### Added

```ts
renderHeader?: (roomState: RoomState, slot: PlayerSlot) => ReactNode;
```

Rendered above the phase body in every state where `slot` is defined. When provided, replaces the default heading block.

### Unchanged

- `onReady`, `renderStarted`, `renderEmpty`, `renderReady`
- All other `PlayerScreenLabels` fields (`invalidSlot`, `roomHeading`, `playerHeading`, `gameStarted`, `joining`, `readyUp`, `readyWaiting`)
- The three-state model (`empty` / `joining` / `ready`) and its transitions

## Behavior matrix

| Condition | Header | Body |
|---|---|---|
| `!slot` (invalid playerId) | none | `labels.invalidSlot` inside `<div role="alert">` |
| `status === "started"` | `renderHeader(state, slot)` if provided, else default `<h2>{roomHeading} {roomId}</h2><h3>{slot.name ?? playerHeading + playerId}</h3>` | `renderStarted()` if provided, else `<div role="status">{labels.gameStarted}</div>` |
| `status === "lobby"`, `slot.status === "empty"` | same header logic as above | `renderEmpty()` if provided, else `labels.invalidSlot` text inside `<div role="alert">` |
| `status === "lobby"`, `slot.status === "joining"` | same header logic | `<div role="status">{labels.joining}</div>` + `<button>{labels.readyUp}</button>` wired to `onReady` |
| `status === "lobby"`, `slot.status === "ready"` | same header logic | `renderReady()` if provided, else `<div role="status">{labels.readyWaiting}</div>` |

### Key behavior shift

The default heading currently renders *inside* the `started` branch's default content, and *separately above* the lobby branches (suppressed when `hasCustomLobby` is true). After this change, the header is a single slot rendered uniformly above the phase body across `started` and all lobby states. Consumers who provide `renderHeader` get it everywhere; consumers who don't get the same default heading everywhere.

### Invalid-slot branch

`!slot` skips the header entirely — there's no valid slot to pass to `renderHeader` and the error is the whole message. This matches current behavior.

## Breaking changes

1. **`onJoin` removed.** Consumers passing `onJoin` will get a TypeScript error. Both known consumers already use a dedicated join route and don't pass this prop, so impact is likely zero in practice — but other consumers may exist.
2. **Empty slot no longer renders a Join button.** If a consumer relied on the default UI for joining, the slot will now render error text instead. Migration: supply a `renderEmpty` callback, or (preferred) route users through a dedicated join page that writes `joining` state.
3. **`labels.joinGame` removed.** Passing it is a TypeScript error.

Pre-1.0 semver allows a minor bump, but release notes should call these out prominently under a **Breaking changes** heading.

## Implementation notes

- `PlayerScreen.tsx` is the only source file that changes.
- The component structure becomes: compute `slot`, early-return on `!slot`, compute `header` node once, then render `<div className={className}>{header}{body}</div>` with `body` selected by `status` / `slot.status`.
- `hasCustomLobby` local (currently gates the default heading) goes away — header rendering is no longer conditional on which render props the consumer supplied.
- No changes to helpers, utils, hooks, or other components.

## Docs and examples to update

- `README.md` — PlayerScreen API reference (remove `onJoin`, add `renderHeader`, update label list)
- `example/src/docs/*.md` — any page referencing `onJoin`, the default Join button, or the header duplication pattern
- `example/` app — remove `onJoin` usage if present; optionally add a `renderHeader` example

## Out of scope

- Collapsing the three-state model to two (`empty` → `ready`). We're keeping `joining` for now; a separate iteration will revisit once we've seen a consumer that actually uses it.
- A `joinUrl` / `joinHref` prop that links to a configured join route. Decided against: the empty state is now an error state, and consumers who want recovery UX can supply `renderEmpty` with their own link.
- Firebase sync hooks, lobby-level settings (language). Tracked separately.
