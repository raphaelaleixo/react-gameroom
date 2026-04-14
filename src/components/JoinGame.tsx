import React, { useState } from "react";

export interface JoinGameProps {
  onJoin: (roomCode: string) => void;
  renderError?: () => React.ReactNode;
  className?: string;
  formClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function JoinGame({ onJoin, renderError, className, formClassName, inputClassName, buttonClassName }: JoinGameProps) {
  const [code, setCode] = useState("");

  const canSubmit = code.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) {
      onJoin(code.trim().toUpperCase());
    }
  }

  return (
    <div className={className}>
      <form className={formClassName} onSubmit={handleSubmit}>
        <label htmlFor="room-code">Room code</label>
        <input
          id="room-code"
          className={inputClassName}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          aria-required="true"
          maxLength={10}
        />

        <button
          className={buttonClassName}
          type="submit"
          disabled={!canSubmit}
        >
          Join
        </button>
      </form>

      {renderError?.()}
    </div>
  );
}
