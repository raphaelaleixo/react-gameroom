# AI Discoverability for react-gameroom

**Date:** 2026-04-14
**Goal:** Make the library easier for AI coding assistants to understand and use correctly.

## Scope

Two additions, no changes to existing runtime behavior:

1. **JSDoc annotations** on all non-component exports
2. **`llms.txt`** at project root — concise, machine-readable API reference
3. **One-liner mentions** in README.md and docs site (ApiPage.tsx)

### Out of scope

- JSDoc on component props
- Extended guides or `llms-full.txt`
- Build config or export changes

## 1. JSDoc Annotations

Add JSDoc to every exported function and type in these files:

- `src/types/room.ts` — describe each type and interface field
- `src/helpers/roomHelpers.ts` — description, `@param`, `@returns` on each function; `@example` on `createInitialRoom`, `joinPlayer`, `startGame`
- `src/utils/roomUtils.ts` — description, `@param`, `@returns` on each function
- `src/hooks/useRoomState.ts` — description, `@param`, `@returns`, `@example` on `useRoomState`

### JSDoc style

- One-line description first, then `@param`/`@returns`/`@example`
- `@example` blocks should be minimal and runnable (3-5 lines)
- No `@since`, `@author`, or other metadata tags
- Describe what the function does and its preconditions (e.g., "No-op if slot is not empty")

## 2. `llms.txt`

A single file at the project root following the llms.txt convention. Structure:

```
# react-gameroom

> One-paragraph overview

## Types

PlayerStatus, RoomStatus, PlayerSlot, RoomConfig, RoomState, RoomDerivedState
(condensed type definitions)

## Helpers

Function signatures with one-line descriptions.

## Hook

useRoomState signature and return type.

## Utils

Function signatures with one-line descriptions.

## Example

End-to-end: create room → join players → check canStart → start game.
~15 lines of code.
```

Target length: 150-200 lines. No component documentation.

## 3. README and Docs Updates

### README.md

Add a line in the "Learn More" section:

```markdown
- **[`llms.txt`](./llms.txt)** — AI-friendly API reference
```

### `example/src/docs/ApiPage.tsx`

Add a note at the top of the API Reference page, after the subtitle paragraph:

```tsx
<p>
  For AI coding assistants, a machine-readable API summary is available in{" "}
  <a href="https://github.com/raphaelaleixo/react-gameroom/blob/main/llms.txt">
    llms.txt
  </a>.
</p>
```

## Validation

- `npm run typecheck` passes
- `npm run build` succeeds
- `llms.txt` is under 200 lines
- All exported functions in helpers, utils, and hooks have JSDoc
