import React from "react";
import type { PlayerSlot } from "../types/room";

export interface PlayerSlotViewProps {
  slot: PlayerSlot;
  onJoin?: () => void;
  onReady?: () => void;
  className?: string;
}

export function PlayerSlotView({ slot, onJoin, onReady, className }: PlayerSlotViewProps) {
  return (
    <div
      className={className}
      aria-label={`Player ${slot.id}`}
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        textAlign: "center",
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
        Player {slot.id}
      </div>

      {slot.status === "empty" && (
        <button type="button" onClick={onJoin} aria-label={`Join as Player ${slot.id}`} style={{ cursor: "pointer" }}>
          Join
        </button>
      )}

      {slot.status === "joining" && (
        <>
          <div role="status" aria-live="polite" style={{ marginBottom: 4 }}>Joining...</div>
          <button type="button" onClick={onReady} aria-label={`Mark Player ${slot.id} as ready`} style={{ cursor: "pointer" }}>
            Ready
          </button>
        </>
      )}

      {slot.status === "ready" && (
        <div role="status" aria-live="polite" style={{ color: "green", fontWeight: "bold" }}>Ready</div>
      )}
    </div>
  );
}
