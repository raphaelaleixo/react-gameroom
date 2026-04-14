import React, { useEffect, useRef } from "react";
import type { RoomState } from "../types/room";
import { RoomQRCode } from "./RoomQRCode";
import { buildPlayerUrl } from "../utils/roomUtils";

/**
 * Customizable labels for RoomInfoModal text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface RoomInfoModalLabels {
  /** Close button aria-label (default: "Close"). */
  close?: string;
  /** Heading prefix before roomId (default: "Room:"). */
  roomHeading?: string;
  /** Suffix after player name in links (default: "Join"). */
  joinLink?: string;
  /** Aria-label prefix for player links (default: "Join link for"). */
  joinLinkAria?: string;
}

const defaultLabels: Required<RoomInfoModalLabels> = {
  close: "Close",
  roomHeading: "Room:",
  joinLink: "Join",
  joinLinkAria: "Join link for",
};

export interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
  closeButtonClassName?: string;
  linkClassName?: string;
  /** Custom labels for modal text. */
  labels?: RoomInfoModalLabels;
}

export function RoomInfoModal({ roomState, open, onClose, className, closeButtonClassName, linkClassName, labels: labelsProp }: RoomInfoModalProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleClose() {
      onClose();
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  const headingId = `room-info-title-${roomState.roomId}`;

  return (
    <dialog
      ref={dialogRef}
      className={className}
      aria-labelledby={headingId}
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        className={closeButtonClassName}
        onClick={onClose}
        aria-label={labels.close}
        data-room-info-close=""
      >
        ✕
      </button>

      <h3 id={headingId}>{labels.roomHeading} {roomState.roomId}</h3>

      <div data-room-info-qr="">
        <RoomQRCode roomId={roomState.roomId} size={160} />
      </div>

      <div data-room-info-links="">
        {roomState.players.map((slot) => {
          const url = buildPlayerUrl(roomState.roomId, slot.id);
          const label = slot.name || `Player ${slot.id}`;
          return (
            <a
              key={slot.id}
              href={url}
              className={linkClassName}
              aria-label={`${labels.joinLinkAria} ${label}`}
            >
              {label} — {labels.joinLink}
            </a>
          );
        })}
      </div>
    </dialog>
  );
}
