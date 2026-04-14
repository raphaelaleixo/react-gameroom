import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { joinPlayer, PlayerScreen, RoomInfoModal } from "react-gameroom";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";
import { NameInput } from "../components/NameInput";
import { RPSPicker } from "../components/RPSPicker";
import { RPSResult } from "../components/RPSResult";
import { db } from "../firebase";

export function PlayerPage() {
  const { roomId, playerId: playerIdStr } = useParams<{
    roomId: string;
    playerId: string;
  }>();
  const playerId = Number(playerIdStr);
  const { roomState, loading, error, updateRoom } = useFirebaseRoom(roomId);

  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{
    winner: number;
    p1Choice: string;
    p2Choice: string;
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const myChoiceRef = ref(db, `rooms/${roomId}/game/choices/${playerId}`);
    const unsub1 = onValue(myChoiceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setMyChoice(val);
    });

    const resultRef = ref(db, `rooms/${roomId}/game/result`);
    const unsub2 = onValue(resultRef, (snapshot) => {
      setGameResult(snapshot.val());
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [roomId, playerId]);

  if (loading) return <div className="page"><div className="text-secondary">Loading...</div></div>;
  if (error || !roomState) return <div className="page"><div className="text-error">Room not found.</div></div>;

  const slot = roomState.players.find((p) => p.id === playerId);
  const myName = slot?.name || `Player ${playerId}`;
  const playerNames: Record<number, string> = {};
  for (const p of roomState.players) {
    if (p.name) playerNames[p.id] = p.name;
  }

  async function handleNameSaved(name: string) {
    if (!roomState) return;
    await updateRoom(joinPlayer(roomState, playerId, name));
  }

  async function handlePick(choice: "rock" | "paper" | "scissors") {
    setMyChoice(choice);
    await set(ref(db, `rooms/${roomId}/game/choices/${playerId}`), choice);
  }

  return (
    <PlayerScreen
      roomState={roomState}
      playerId={playerId}
      className="page"
      renderStarted={() => (
        <>
          <button type="button" className="info-btn" onClick={() => setShowInfo(true)}>i</button>
          <RoomInfoModal
            roomState={roomState}
            open={showInfo}
            onClose={() => setShowInfo(false)}
            className="room-info-modal"
            closeButtonClassName="room-info-close"
            linkClassName="room-info-link"
          />

          <h2 className="title" style={{ fontSize: 24, marginBottom: 8 }}>Rock Paper Scissors</h2>
          <div className="player-header">
            {myName}
          </div>

          {!myChoice && (
            <div style={{ textAlign: "center" }}>
              <p className="text-secondary" style={{ marginBottom: 16 }}>Choose your move:</p>
              <RPSPicker onPick={handlePick} disabled={false} />
            </div>
          )}

          {myChoice && !gameResult && (
            <div className="text-secondary" style={{ textAlign: "center", marginTop: 16 }}>
              You chose <span className="text-accent" style={{ fontWeight: 700 }}>{myChoice}</span>. Waiting for opponent...
            </div>
          )}

          {gameResult && <RPSResult result={gameResult} playerNames={playerNames} />}
        </>
      )}
      renderEmpty={() => (
        <>
          <div className="player-header">Room {roomState.roomId} · Player {playerId}</div>
          <NameInput onNameSaved={handleNameSaved} />
        </>
      )}
      renderReady={() => (
        <>
          <div className="player-header">Room {roomState.roomId} · Player {playerId}</div>
          <div className="text-secondary" style={{ marginBottom: 12 }}>
            Playing as: <span className="text-accent">{myName}</span>
          </div>
          <div className="slot-status-ready" style={{ fontSize: 24 }}>
            Ready!
          </div>
          <div className="text-secondary" style={{ marginTop: 8 }}>
            Waiting for others...
          </div>
        </>
      )}
    />
  );
}
