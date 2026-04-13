import React, { useState } from "react";

export interface JoinGameProps {
  onJoin: (roomCode: string) => void;
  className?: string;
}

export function JoinGame({ onJoin, className }: JoinGameProps) {
  const [code, setCode] = useState("");

  const canSubmit = code.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) {
      onJoin(code.trim().toUpperCase());
    }
  }

  return (
    <div className={className} style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Join Game</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="room-code"
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 14,
            }}
          >
            Room code
          </label>
          <input
            id="room-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            aria-required="true"
            maxLength={10}
            style={{
              padding: "10px 12px",
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "10px 24px",
            fontSize: 16,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          Join
        </button>
      </form>
    </div>
  );
}
