import { useNavigate } from "react-router-dom";
import { set, ref } from "firebase/database";
import { createInitialRoom } from "react-gameroom";
import { db } from "../firebase";

export function HomePage() {
  const navigate = useNavigate();

  async function handleNewGame() {
    const room = createInitialRoom({
      minPlayers: 2,
      maxPlayers: 2,
      requireFull: true,
    });
    await set(ref(db, `rooms/${room.roomId}/state`), room);
    navigate(`/room/${room.roomId}`);
  }

  function handleJoinGame() {
    navigate("/join");
  }

  return (
    <div className="page">
      <h1 className="title">Rock Paper Scissors</h1>
      <p className="text-secondary" style={{ marginBottom: 16, fontSize: 14, letterSpacing: 1 }}>
        An example implementation of <a href="https://github.com/raphaelaleixo/react-gameroom" target="_blank" rel="noopener noreferrer">react-gameroom</a>
      </p>
      <div className="title-emoji">
        <span>✊</span>
        <span>✋</span>
        <span>✌️</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 280,
        }}
      >
        <button type="button" className="btn" onClick={handleNewGame}>
          New Game
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleJoinGame}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}
