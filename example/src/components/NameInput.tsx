import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "../firebase";

interface NameInputProps {
  roomId: string;
  playerId: number;
  onNameSaved?: () => void;
}

export function NameInput({ roomId, playerId, onNameSaved }: NameInputProps) {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const nameRef = ref(db, `rooms/${roomId}/playerNames/${playerId}`);
    const unsubscribe = onValue(nameRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setName(val);
        setSaved(true);
      }
    });
    return unsubscribe;
  }, [roomId, playerId]);

  async function handleSave() {
    if (!name.trim()) return;
    await set(ref(db, `rooms/${roomId}/playerNames/${playerId}`), name.trim());
    setSaved(true);
    onNameSaved?.();
  }

  if (saved) {
    return (
      <div className="text-secondary" style={{ marginBottom: 12 }}>
        Playing as: <span className="text-accent">{name}</span>
      </div>
    );
  }

  return (
    <div className="name-input-group">
      <input
        className="input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button
        type="button"
        className="btn"
        onClick={handleSave}
        disabled={!name.trim()}
        style={{ padding: "10px 20px", fontSize: 14 }}
      >
        OK
      </button>
    </div>
  );
}
