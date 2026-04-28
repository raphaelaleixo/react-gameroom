import React, { useEffect, useRef } from "react";
import type { RoomState } from "../types/room";
import { RoomQRCode } from "./RoomQRCode";
import { buildPlayerUrl, buildJoinUrl, buildRejoinUrl } from "../utils/roomUtils";

/**
 * Customizable labels for RoomInfoModal text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface RoomInfoModalLabels {
  /** Close button aria-label (default: "Close"). */
  close?: string;
  /** Heading prefix before roomId (default: "Room:"). */
  roomHeading?: string;
  /** Suffix after player name in lobby links (default: "Join"). */
  joinLink?: string;
  /** Aria-label prefix for lobby player links (default: "Join link for"). */
  joinLinkAria?: string;
  /** Suffix after player name in started links (default: "Rejoin"). */
  rejoinLink?: string;
  /** Aria-label prefix for started player links (default: "Rejoin link for"). */
  rejoinLinkAria?: string;
}

const defaultLabels: Required<RoomInfoModalLabels> = {
  close: "Close",
  roomHeading: "Room:",
  joinLink: "Join",
  joinLinkAria: "Join link for",
  rejoinLink: "Rejoin",
  rejoinLinkAria: "Rejoin link for",
};

export interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
  closeButtonClassName?: string;
  linkClassName?: string;
  /** Optional base path for URL generation (e.g., "/app"). */
  basePath?: string;
  /**
   * Override the QR-encoded URL. When omitted, derived from roomState.status + basePath
   * (lobby → buildJoinUrl, started → buildRejoinUrl).
   * Only affects the QR code; the link list still derives /room/{id}/player/{n} URLs internally.
   */
  qrUrl?: string;
  /** Custom labels for modal text. */
  labels?: RoomInfoModalLabels;
}

export function RoomInfoModal({ roomState, open, onClose, className, closeButtonClassName, linkClassName, basePath, qrUrl, labels: labelsProp }: RoomInfoModalProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const isStarted = roomState.status === "started";
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
  const derivedQrUrl = isStarted
    ? buildRejoinUrl(roomState.roomId, basePath)
    : buildJoinUrl(roomState.roomId, basePath);
  const finalQrUrl = qrUrl ?? derivedQrUrl;
  const linkLabel = isStarted ? labels.rejoinLink : labels.joinLink;
  const linkAria = isStarted ? labels.rejoinLinkAria : labels.joinLinkAria;

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
        <RoomQRCode roomId={roomState.roomId} url={finalQrUrl} size={160} />
      </div>

      <div data-room-info-links="">
        {roomState.players.map((slot) => {
          const url = buildPlayerUrl(roomState.roomId, slot.id, basePath);
          const label = slot.name || `Player ${slot.id}`;
          return (
            <a
              key={slot.id}
              href={url}
              className={linkClassName}
              aria-label={`${linkAria} ${label}`}
            >
              {label} — {linkLabel}
            </a>
          );
        })}
      </div>
    </dialog>
  );
}
