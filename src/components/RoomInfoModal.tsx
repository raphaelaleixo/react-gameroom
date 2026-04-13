import React, { useEffect, useRef, useCallback } from "react";
import type { RoomState } from "../types/room";
import { RoomQRCode } from "./RoomQRCode";
import { buildPlayerUrl } from "../utils/roomUtils";

export interface RoomInfoModalProps {
  roomState: RoomState;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function RoomInfoModal({ roomState, open, onClose, className }: RoomInfoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [open]);

  if (!open) return null;

  const headingId = `room-info-title-${roomState.roomId}`;

  return (
    <div
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={className}
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 24,
          borderRadius: 12,
          maxWidth: 400,
          width: "90%",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "inherit",
          }}
        >
          ✕
        </button>

        <h3 id={headingId} style={{ marginTop: 0, marginBottom: 16 }}>Room: {roomState.roomId}</h3>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <RoomQRCode roomId={roomState.roomId} size={160} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {roomState.players.map((slot) => {
            const url = buildPlayerUrl(roomState.roomId, slot.id);
            return (
              <a
                key={slot.id}
                href={url}
                aria-label={`Join link for Player ${slot.id}`}
                style={{
                  display: "block",
                  padding: "10px 16px",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  textAlign: "center",
                  textDecoration: "none",
                  color: "inherit",
                  fontSize: 14,
                }}
              >
                Player {slot.id} — Join
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
