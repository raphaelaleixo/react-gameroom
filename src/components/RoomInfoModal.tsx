import React, { useEffect, useRef } from "react";
import type { RoomState } from "../types/room";
import { RoomQRCode } from "./RoomQRCode";
import { buildPlayerUrl } from "../utils/roomUtils";

export interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
  closeButtonClassName?: string;
  linkClassName?: string;
}

export function RoomInfoModal({ roomState, open, onClose, className, closeButtonClassName, linkClassName }: RoomInfoModalProps) {
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
        aria-label="Close"
        data-room-info-close=""
      >
        ✕
      </button>

      <h3 id={headingId}>Room: {roomState.roomId}</h3>

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
              aria-label={`Join link for ${label}`}
            >
              {label} — Join
            </a>
          );
        })}
      </div>
    </dialog>
  );
}
