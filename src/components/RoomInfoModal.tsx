import React from "react";
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
  if (!open) return null;

  return (
    <div
      onClick={onClose}
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

        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Room: {roomState.roomId}</h3>

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
