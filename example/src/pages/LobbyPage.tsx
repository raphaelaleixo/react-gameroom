import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import {
  setPlayerReady,
  startGame,
  Lobby,
  RoomQRCode,
  RoomInfoModal,
  buildPlayerUrl,
} from "react-gameroom";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";
import { RPSResult } from "../components/RPSResult";
import { db } from "../firebase";

const choiceEmoji: Record<string, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

function determineWinner(p1: string, p2: string): number {
  if (p1 === p2) return 0;
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return 1;
  }
  return 2;
}

export function LobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { roomState, loading, error, updateRoom } = useFirebaseRoom(roomId);

  const [choices, setChoices] = useState<Record<number, string>>({});
  const [gameResult, setGameResult] = useState<{
    winner: number;
    p1Choice: string;
    p2Choice: string;
  } | null>(null);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const choicesRef = ref(db, `rooms/${roomId}/game/choices`);
    const unsub1 = onValue(choicesRef, (snapshot) => {
      setChoices(snapshot.val() || {});
    });

    const resultRef = ref(db, `rooms/${roomId}/game/result`);
    const unsub2 = onValue(resultRef, (snapshot) => {
      setGameResult(snapshot.val());
    });

    const namesRef = ref(db, `rooms/${roomId}/playerNames`);
    const unsub3 = onValue(namesRef, (snapshot) => {
      setPlayerNames(snapshot.val() || {});
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || gameResult) return;
    const p1 = choices[1];
    const p2 = choices[2];
    if (p1 && p2) {
      const winner = determineWinner(p1, p2);
      const result = { winner, p1Choice: p1, p2Choice: p2 };
      set(ref(db, `rooms/${roomId}/game/result`), result);
    }
  }, [choices, roomId, gameResult]);

  if (loading) return <div className="page"><div className="text-secondary">Loading...</div></div>;
  if (error || !roomState) return <div className="page"><div className="text-error">Room not found.</div></div>;

  // Game started — versus screen
  if (roomState.status === "started") {
    const name1 = playerNames[1] || "Player 1";
    const name2 = playerNames[2] || "Player 2";
    const waitingCount = 2 - Object.keys(choices).length;

    return (
      <div className="page">
        <button type="button" className="info-btn" onClick={() => setShowInfo(true)}>i</button>
        <RoomInfoModal
          roomState={roomState}
          open={showInfo}
          onClose={() => setShowInfo(false)}
          className="room-info-modal"
        />

        <h2 className="title" style={{ fontSize: 28, marginBottom: 24 }}>Rock Paper Scissors</h2>

        {!gameResult && (
          <>
            <div className="vs-screen">
              <div className="vs-player">
                <div className="vs-player-name">{name1}</div>
                <div className="vs-hidden">{choices[1] ? "✓" : "?"}</div>
                <div className="vs-player-choice-label">{choices[1] ? "Chosen" : "Choosing..."}</div>
              </div>
              <div className="vs-divider">VS</div>
              <div className="vs-player">
                <div className="vs-player-name">{name2}</div>
                <div className="vs-hidden">{choices[2] ? "✓" : "?"}</div>
                <div className="vs-player-choice-label">{choices[2] ? "Chosen" : "Choosing..."}</div>
              </div>
            </div>
            {waitingCount > 0 && (
              <div className="vs-waiting">
                Waiting for {waitingCount} player{waitingCount > 1 ? "s" : ""} to choose...
              </div>
            )}
          </>
        )}

        {gameResult && <RPSResult result={gameResult} playerNames={playerNames} />}
      </div>
    );
  }

  // Lobby
  return (
    <div className="page-top">
      <div className="lobby-header">
        <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 700 }}>Waiting for Players</h2>
        <div className="room-badge">{roomState.roomId}</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="qr-wrapper">
          <RoomQRCode roomId={roomState.roomId} size={160} />
        </div>
      </div>

      <Lobby
        roomState={roomState}
        className="lobby-inner"
        gridClassName="lobby-grid"
        slotClassName="slot"
        buttonClassName="btn"
        onJoin={(playerId) => {
          window.location.href = buildPlayerUrl(roomState.roomId, playerId);
        }}
        onReady={(playerId) => updateRoom(setPlayerReady(roomState, playerId))}
        onStart={() => updateRoom(startGame(roomState))}
      />
    </div>
  );
}
