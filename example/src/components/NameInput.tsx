import { useState } from "react";

interface NameInputProps {
  onNameSaved: (name: string) => void;
}

export function NameInput({ onNameSaved }: NameInputProps) {
  const [name, setName] = useState("");

  function handleSave() {
    if (!name.trim()) return;
    onNameSaved(name.trim());
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
