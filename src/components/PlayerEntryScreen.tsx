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
