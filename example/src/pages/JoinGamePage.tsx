import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { roomExists, findFirstEmptySlot } from "../hooks/useFirebaseRoom";

export function JoinGamePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!code.trim()) return;
    setError(null);

    const trimmed = code.trim().toUpperCase();
    const exists = await roomExists(trimmed);
    if (!exists) {
      setError("Room not found. Check the code and try again.");
      return;
    }

    const slotId = await findFirstEmptySlot(trimmed);
    if (slotId === null) {
      setError("Room is full.");
      return;
    }

    navigate(`/room/${trimmed}/player/${slotId}`);
  }

  return (
    <div className="page">
      <h2 className="text-accent" style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Join a Game
      </h2>
      <div className="join-form">
        <input
          className="input"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ROOM CODE"
          maxLength={10}
        />
        <button
          type="button"
          className="btn"
          onClick={handleJoin}
          disabled={!code.trim()}
          style={{ width: "100%" }}
        >
          Join
        </button>
      </div>
      {error && <div className="text-error">{error}</div>}
      <Link to="/" className="back-link">← Back</Link>
    </div>
  );
}
