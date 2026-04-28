import { useNavigate, useParams } from "react-router-dom";
import { joinPlayer, PlayerEntryScreen } from "react-gameroom";
import { useFirebaseRoom } from "../hooks/useFirebaseRoom";

export function PlayerEntryPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { roomState, loading, error, updateRoom } = useFirebaseRoom(roomId);

  if (loading) return <div className="page"><div className="text-secondary">Loading...</div></div>;
  if (error || !roomState) return <div className="page"><div className="text-error">Room not found.</div></div>;

  async function handleJoin(name: string, slotId: number) {
    if (!roomState) return;
    await updateRoom(joinPlayer(roomState, slotId, name));
    navigate(`/play/room/${roomState.roomId}/player/${slotId}`);
  }

  return (
    <PlayerEntryScreen
      roomState={roomState}
      onJoin={handleJoin}
      basePath="/play"
      className="page"
      formClassName="join-form"
      inputClassName="input"
      buttonClassName="btn"
      linkClassName="room-info-link"
    />
  );
}
