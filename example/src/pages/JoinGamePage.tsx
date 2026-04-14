import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { JoinGame } from "react-gameroom";
import { roomExists, findFirstEmptySlot } from "../hooks/useFirebaseRoom";

export function JoinGamePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(roomCode: string) {
    setError(null);

    const exists = await roomExists(roomCode);
    if (!exists) {
      setError("Room not found. Check the code and try again.");
      return;
    }

    const slotId = await findFirstEmptySlot(roomCode);
    if (slotId === null) {
      setError("Room is full.");
      return;
    }

    navigate(`/room/${roomCode}/player/${slotId}`);
  }

  return (
    <div className="page">
      <h2 className="text-accent" style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Join a Game
      </h2>
      <JoinGame
        onJoin={handleJoin}
        formClassName="join-form"
        inputClassName="input"
        buttonClassName="btn"
        renderError={() => error ? <div className="text-error">{error}</div> : null}
      />
      <Link to="/" className="back-link">← Back</Link>
    </div>
  );
}
