# Headless Lobby Styling

## Problem

The library claims to be "headless in terms of theming" but `Lobby`, `PlayerSlotsGrid`, and `PlayerSlotView` use hardcoded inline styles that prevent consumers from styling via CSS. The example app has a dark gaming theme in `styles.css` that cannot take effect because inline styles always win.

After refactoring `LobbyPage.tsx` to use `<Lobby>`, the example lost its themed appearance.

## Design

### Approach: Remove inline styles, add data attributes and className passthrough

**PlayerSlotView** (`src/components/PlayerSlotView.tsx`)
- Remove all inline styles from the wrapper div and child elements
- Add `data-status={slot.status}` to the wrapper div (values: `"empty"`, `"joining"`, `"ready"`)
- Keep all existing aria attributes and semantic HTML (buttons for join/ready, `role="status"` on status text)

**PlayerSlotsGrid** (`src/components/PlayerSlotsGrid.tsx`)
- Remove inline grid styles (`display: grid`, `gridTemplateColumns`, `gap`)
- Add `slotClassName?: string` prop, forwarded to each `PlayerSlotView`'s `className`
- Keep `role="list"`, `aria-label`, and `role="listitem"` wrappers

**Lobby** (`src/components/Lobby.tsx`)
- Remove all inline styles (wrapper padding, margins, button styling)
- Add new props:
  - `gridClassName?: string` — forwarded to `PlayerSlotsGrid`'s `className`
  - `slotClassName?: string` — forwarded to `PlayerSlotsGrid`'s `slotClassName`
  - `buttonClassName?: string` — applied to the Start Game button
- Keep existing `className` prop (for the wrapper div)
- Keep `role="status"` and `aria-live="polite"` on the ready count

**Example LobbyPage** (`example/src/pages/LobbyPage.tsx`)
- Wrap `<Lobby>` in a parent div with the heading ("Waiting for Players"), room badge, and QR code — matching the old custom layout
- Pass className props: `className` for grid area, `gridClassName="lobby-grid"`, `slotClassName="slot"`, `buttonClassName="btn"`

**Example CSS** (`example/src/styles.css`)
- Update slot status selectors from BEM modifiers to data-attribute selectors:
  - `.slot--joining` becomes `.slot[data-status="joining"]`
  - `.slot--ready` becomes `.slot[data-status="ready"]`
  - `.slot--clickable` applies to all slots (clickable by default)
  - `.slot--clickable.slot--ready` becomes `.slot[data-status="ready"]` with adjusted rules

**README** (`README.md`)
- Update `<Lobby>` API docs to document `gridClassName`, `slotClassName`, `buttonClassName` props
- Update `<PlayerSlotsGrid>` docs to document `slotClassName` prop
- Update `<PlayerSlotView>` docs to mention `data-status` attribute
- Note inline styles removal in component descriptions

## Files to modify

1. `src/components/PlayerSlotView.tsx`
2. `src/components/PlayerSlotsGrid.tsx`
3. `src/components/Lobby.tsx`
4. `example/src/pages/LobbyPage.tsx`
5. `example/src/styles.css`
6. `README.md`
