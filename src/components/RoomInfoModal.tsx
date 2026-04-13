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

        <div>
          {roomState.players.map((slot) => {
            const url = buildPlayerUrl(roomState.roomId, slot.id);
            return (
              <div key={slot.id} style={{ marginBottom: 8, fontSize: 14 }}>
                <div style={{ marginBottom: 2 }}>Player {slot.id}:</div>
                <a href={url} style={{ wordBreak: "break-all" }}>{url}</a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
