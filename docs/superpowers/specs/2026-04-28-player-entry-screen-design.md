# PlayerEntryScreen + RoomInfoModal.qrUrl design

## Motivation

Two pieces of feedback from the consumer-driven iteration loop (Krimi, Unmatched, and the in-progress third game):

1. **`RoomInfoModal` always derives its QR URL from the room status.** Some consumers want to point the QR at a custom URL — a deep link into their app, a shortened share URL, a non-standard route — without having to fork the modal. A small additive prop solves this.

2. **The "player landing" route is the same shape in every game.** Each consumer is hand-rolling the same component on `/room/{code}/player`: render a name form when the lobby has space, render a list of seat-rejoin links once the game has started, fall back to a "lobby full" message in the awkward middle. Owning this in the library removes the most-copied chunk of glue code in the consumer apps.

## Scope

**In scope:**
- Optional `qrUrl?: string` prop on `RoomInfoModalProps` that overrides the auto-derived QR URL when provided.
- New `PlayerEntryScreen` component covering the three states of the player-landing route (form / lobby-full / seat-link grid).
- New `PlayerEntryScreenLabels` and `PlayerEntryScreenProps` exported types.
- Exports from `src/index.ts`.
- README + `example/src/docs/` updates for both changes.

**Explicitly out of scope:**
- No new URL helper. `buildJoinUrl` already produces `/room/{id}/player`, which is exactly where `PlayerEntryScreen` lives. `buildRejoinUrl` (`/room/{id}/players`) stays — consumers who collapse the routes simply won't use it; consumers who keep them separate can.
- No changes to `parseRoomFromUrl`. Its existing `isJoin` flag already identifies the player-landing route.
- No changes to existing components beyond `RoomInfoModal`'s one new prop.
- No `data` parameter on `onJoin`. Consumers who want to attach game-specific data to a slot do it inside their `onJoin` handler when calling `setPlayerJoining(state, slotId, name, data)`. Surfacing it on the component API would clutter every call site for a minority case.
- No version bump or changelog entry as part of this work — those are release-time concerns.

## API

### `RoomInfoModal.qrUrl`

```ts
export interface RoomInfoModalProps {
  // ...existing props unchanged
  /** Override the QR-encoded URL. When omitted, derived from roomState.status + basePath. */
  qrUrl?: string;
}
```

Inside the component the existing derivation becomes a fallback:

```ts
const derivedQrUrl = isStarted
  ? buildRejoinUrl(roomState.roomId, basePath)
  : buildJoinUrl(roomState.roomId, basePath);
const finalQrUrl = qrUrl ?? derivedQrUrl;
```

`basePath` keeps its current role for the link-list section, which still derives `/room/{id}/player/{n}` URLs internally. `qrUrl` only affects the QR code, not the link list — that separation is intentional: most consumers who want a custom QR target still want the in-modal links to map to real seats.

Pure addition. Backwards-compatible. No behavior change when omitted.

### `PlayerEntryScreen`

```ts
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

export interface PlayerEntryScreenProps {
  roomState: RoomState;
  /** Called when the player submits the form. slotId is computed via findFirstEmptySlot. */
  onJoin: (name: string, slotId: number) => void | Promise<void>;

  /** Replace the entire form half. Passed a submit helper that runs onJoin with the resolved slotId. */
  renderForm?: (helpers: { submit: (name: string) => void | Promise<void>; isSubmitting: boolean }) => React.ReactNode;
  /** Replace the started/seat-grid half. */
  renderStarted?: () => React.ReactNode;
  /** Replace the lobby-full message. */
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
```

#### Render logic

```ts
const emptySlot = findFirstEmptySlot(roomState.players);
const isStarted = roomState.status === "started";

if (isStarted) {
  // → seat-link grid (filled players only)
} else if (!emptySlot) {
  // → "Lobby full" message
} else {
  // → name form (slotId = emptySlot.id)
}
```

**Form half (default):**
- Heading + name input + submit button.
- Tracks `isSubmitting` internally — same pattern as `JoinGame`. Button disabled, label flips to `labels.submitting` while a submit is in flight.
- On submit, calls `onJoin(name.trim(), emptySlot.id)` and awaits.

**Seat-link grid (default):**
- Heading + list of `<a>` elements, one per slot where `status !== "empty"`.
- Each link: `href={buildPlayerUrl(roomId, slot.id, basePath)}`, label `"{slot.name || \`Player ${slot.id}\`} — {labels.rejoinLink}"`, aria-label `"{labels.rejoinLinkAria} {name}"`.
- Visually mirrors the link-list section of `RoomInfoModal`. Deliberately not extracting a shared subcomponent — three lines of JSX, premature abstraction.
- Edge case: zero filled slots (started with no players, possible only via external state corruption) renders the heading with an empty list — no special handling.

**Lobby-full half (default):**
- Single `role="status"` div with `labels.lobbyFull` text.

**Render-prop precedence:** `renderForm` / `renderStarted` / `renderFull` each replace their respective branch entirely when provided. They don't compose with the default — same pattern as `PlayerScreen.renderStarted` / `renderEmpty` / `renderReady`.

The `renderForm` helpers (`submit`, `isSubmitting`) let a custom form drive the same async flow without re-implementing it. Consumers who need extra state (custom data, multi-step forms) ignore `submit` and call `onJoin` themselves.

## Naming

`PlayerEntryScreen` pairs naturally with the existing `PlayerScreen`: one is the screen for arriving at a player URL without a seat yet, the other is the screen for being in a seat. The `*Screen` suffix already signals "full-route component" in the codebase (`PlayerScreen`). `JoinGame` stays as the room-code form — different concept, different vocabulary.

## Files touched

- `src/components/PlayerEntryScreen.tsx` — new file.
- `src/components/RoomInfoModal.tsx` — add `qrUrl?` prop, use as fallback to existing derivation.
- `src/index.ts` — export `PlayerEntryScreen`, `PlayerEntryScreenProps`, `PlayerEntryScreenLabels`.
- `README.md` — new section for `PlayerEntryScreen` with a usage snippet showing it on `/room/:code/player`; brief addition to the `RoomInfoModal` section noting `qrUrl`.
- `example/src/docs/` — the docs site uses aggregated pages (`ApiPage.tsx`, `GuidePage.tsx`, `ExamplesPage.tsx`, `DocsHome.tsx`) rather than one-page-per-component. Add `PlayerEntryScreen` entries to each page where the comparable existing components (`PlayerScreen`, `JoinGame`, `RoomInfoModal`) appear, matching the surrounding shape of those entries. Add a brief mention of `RoomInfoModal.qrUrl` to the API entry for `RoomInfoModal`.

## Conventions followed

- `*Props` and `*Labels` interface naming.
- `labels` object with `Required<*Labels>` defaults merged via spread — same shape as every other component in the lib.
- Class-name passthrough props (`className`, `formClassName`, etc.) — same shape as `JoinGame`.
- `data-*` hooks for consumer styling where appropriate, mirroring `RoomInfoModal` (`data-room-info-qr=""`, etc.). Specifically: `data-player-entry-form=""`, `data-player-entry-links=""`, `data-player-entry-full=""` so consumers can target each branch from CSS without depending on internal class names.
- Render-prop escape hatches mirror `PlayerScreen`.
- No internal state for `roomState` — caller-owned, like every other component in the lib.

## Testing

There is no test runner configured in this repo. Verification is via:
- `npm run typecheck` — confirms the new prop and component compile against the existing types and that consumer call sites compile.
- `npm run build` — confirms the bundler produces clean CJS/ESM/types.
- Manual smoke test in `example/` — walk the three states (form, lobby-full, seat-link grid) by manipulating `roomState` and confirm the right branch renders.
