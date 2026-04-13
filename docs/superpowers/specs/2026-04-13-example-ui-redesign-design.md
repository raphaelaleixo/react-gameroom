# Example App UI Redesign + RoomInfoModal

## Overview

Redesign the example Rock-Paper-Scissors app with a dark/gaming aesthetic and add a new `RoomInfoModal` library component that lets users access room info (QR code + player links) at any point during gameplay.

## Decisions

- **Visual direction:** Dark/gaming — dark backgrounds, neon accents, bold typography
- **Room info access:** Floating modal triggered by an "i" button, available on both host and player views after game starts
- **RoomInfoModal location:** Library component (not example-only) — useful for any game built with the library
- **Styling approach:** Single CSS file in the example app, no new dependencies
- **Game started view:** Dramatic versus screen with choice reveal and result announcement
- **Mobile view:** Same dark theme, touch-optimized with larger tap targets

## Theme

| Token          | Value     | Usage                          |
|----------------|-----------|--------------------------------|
| bg-primary     | `#1a1a2e` | Page background                |
| bg-surface     | `#16213e` | Cards, inputs, panels          |
| border         | `#0f3460` | Card/input borders             |
| accent         | `#e94560` | Buttons, highlights, glows     |
| text-primary   | `#ffffff` | Headings, primary text         |
| text-secondary | `#a0a0b0` | Descriptions, labels           |

- Font: system sans-serif stack
- Border radius: 12px for cards, 8px for buttons/inputs
- Glow effect: `box-shadow: 0 0 N rgba(233, 69, 96, alpha)` on accent elements
- Headings: uppercase, letter-spaced

## New Library Component: RoomInfoModal

**File:** `src/components/RoomInfoModal.tsx`

**Exported from:** `src/index.ts`

### Props

```typescript
interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
}
```

### Behavior

- When `open` is true, renders a semi-transparent backdrop + centered modal card
- Backdrop click calls `onClose`
- Modal contains:
  - Room code heading
  - QR code (reuses `RoomQRCode` internally)
  - List of player URLs (one per slot, built via `buildPlayerUrl`)
  - Close button (X) in top-right corner
- Minimal inline styles for layout/positioning (backdrop overlay, centering, z-index) — consistent with existing library component style
- `className` applied to modal container for consumer styling
- Theme-agnostic: the example's CSS adds the dark/gaming look

## Example App: styles.css

**File:** `example/src/styles.css`, imported in `example/src/main.tsx`

Defines all dark theme styles using CSS classes:

- `.page` — full-height dark background, centered content
- `.card` — surface background, border, rounded corners, shadow
- `.btn` — accent background, glow, hover brightens
- `.btn--disabled` — dimmed, no glow
- `.input` — surface background, border, accent focus ring
- `.slot--empty` — dimmed, dashed border
- `.slot--joining` — accent border, glow hint
- `.slot--ready` — solid accent, bold "READY"
- `.modal-backdrop` — dark overlay
- `.modal` — surface card, centered
- `.vs-screen`, `.result` — versus layout styles
- `.rps-btn` — large touch-friendly emoji buttons (~80px)
- `.info-btn` — circular "i" button, accent, positioned top-right
- `.title-screen` — centered layout for homepage

## Page-by-Page Changes

### HomePage

- Centered title screen layout
- "ROCK PAPER SCISSORS" in large, bold, uppercase, letter-spaced, accent color
- Rock/paper/scissors emoji (✊✋✌️) displayed large below title with subtle glow
- "New Game" and "Join Game" buttons — accent glow style
- Same logic: create room → navigate to lobby, or navigate to /join

### JoinGamePage

- "Join a Game" heading in accent color
- Dark styled room code input (uppercase, letter-spaced)
- Join button with accent glow, disabled state dimmed
- Error messages in muted warning color
- Back navigation to homepage

### LobbyPage (before game starts)

- Room code in a styled badge at top (uppercase, letter-spaced, accent border)
- QR code centered on a surface card with glow/border treatment
- Player URLs shown as copyable links below QR code
- Player slots as dark cards:
  - Empty: dimmed, dashed border
  - Joining: accent border, glow
  - Ready: solid accent border, "READY" in accent
- Ready count: "1/2 Ready" in accent
- Start Game button: large, accent, glowing when canStart, dimmed otherwise

### LobbyPage (after game starts) — Versus Screen

- Two player panels side by side, "VS" centered between them with glow
- Each panel shows player name and choice emoji (large)
- Choices hidden ("?") until both players have picked, then revealed
- Result announcement: "PLAYER 1 WINS!" or "IT'S A DRAW!" — large, accent, glowing
- Info button ("i") in top-right corner → opens RoomInfoModal

### PlayerPage

- Compact header: "Room ABC12 · Player 1"
- Name input: dark surface, accent focus, "OK" button
- Player status after joining: styled like lobby cards
- RPS Picker (game started): three large tappable emoji buttons (~80px) on surface cards, selected gets accent border + glow
- Result: both choices shown, winner announcement, compact layout
- Info button ("i") in top-right → opens RoomInfoModal

## New Example Component: RoomInfoModal trigger

Not a separate component — just a `useState<boolean>` in LobbyPage and PlayerPage that controls `<RoomInfoModal open={showInfo} onClose={() => setShowInfo(false)} roomState={roomState} />`, with a small circular button to toggle it.

## Files Changed

### Library (new)
- `src/components/RoomInfoModal.tsx` — new component
- `src/index.ts` — export RoomInfoModal + RoomInfoModalProps

### Example (modified)
- `example/src/styles.css` — new file, all theme styles
- `example/src/main.tsx` — import styles.css
- `example/src/pages/HomePage.tsx` — title screen redesign
- `example/src/pages/JoinGamePage.tsx` — dark theme restyle
- `example/src/pages/LobbyPage.tsx` — lobby restyle + versus screen + room info modal
- `example/src/pages/PlayerPage.tsx` — dark theme + touch-friendly RPS + room info modal
- `example/src/components/RPSPicker.tsx` — styled emoji buttons
- `example/src/components/RPSResult.tsx` — styled result display
- `example/src/components/NameInput.tsx` — dark theme input

### Docs
- `README.md` — document RoomInfoModal component

## Out of Scope

- No changes to existing library component internals (Lobby, PlayerScreen, PlayerSlotView, etc.)
- No changes to helpers, hooks, utils, or types (beyond adding the new modal)
- No new dependencies
- No animations/transitions (keep it CSS-only, no framer-motion etc.)
- No responsive breakpoints beyond basic touch-friendly sizing on mobile
