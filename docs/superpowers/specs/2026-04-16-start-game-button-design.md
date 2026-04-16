# StartGameButton Component

## Summary

Add a `StartGameButton` component that eliminates the boilerplate every consumer writes: wiring `startGame()` + `disabled={!canStart}` into a button. The component calls `startGame` internally and hands the transitioned `RoomState` to an `onStart` callback.

Motivated by consumer feedback — every game built on react-gameroom repeats this exact pattern (see `example/src/pages/LobbyPage.tsx:157-165`).

## Props

```ts
interface StartGameButtonLabels {
  /** Button text (default: "Start Game"). */
  start?: string;
}

interface StartGameButtonProps<T = unknown> {
  /** Current room state. */
  roomState: RoomState<T>;
  /** Called with the transitioned RoomState (status: "started") when the button is clicked. */
  onStart: (newState: RoomState<T>) => void;
  /** Customizable button text for i18n. */
  labels?: StartGameButtonLabels;
  /** CSS class applied to the <button> element. */
  className?: string;
}
```

## Behavior

- Uses `useRoomState(roomState)` internally to derive `canStart`.
- Button is `disabled` when `!canStart`.
- On click: calls `startGame(roomState)` and passes the result to `onStart`.
- If `startGame` returns the same state (preconditions not met), `onStart` still receives it — the consumer's state layer handles idempotency, consistent with the helpers' design.

## File structure

- **Component**: `src/components/StartGameButton.tsx`
- **Export**: added to `src/index.ts` barrel (component + props type + labels type)

## Conventions followed

- `*Props` / `*Labels` suffix on interfaces, matching `JoinGame`, `PlayerScreen`, etc.
- Prop-driven, presentational, no internal state management.
- Single `className` prop on the root element (no wrapper div — single element component).
- Labels pattern with defaults, same as `JoinGame`.
- Generic `<T>` threaded through to preserve consumer's slot data type.

## Consumer usage

```tsx
<StartGameButton
  roomState={roomState}
  onStart={updateRoom}
  labels={{ start: "Begin Round" }}
  className="btn"
/>
```

Replaces:

```tsx
<button
  type="button"
  className="btn"
  onClick={() => updateRoom(startGame(roomState))}
  disabled={!canStart}
>
  Start Game
</button>
```

## Scope

This spec covers only the StartGameButton component. URL helper configurability was considered and deferred — `basePath` is sufficient for current consumers.
