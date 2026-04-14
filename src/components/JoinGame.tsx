import React, { useState } from "react";

export interface JoinGameProps {
  onJoin: (roomCode: string) => void | Promise<void>;
  renderError?: () => React.ReactNode;
  className?: string;
  formClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function JoinGame({ onJoin, renderError, className, formClassName, labelClassName, inputClassName, buttonClassName }: JoinGameProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = code.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onJoin(code.trim().toUpperCase());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <form className={formClassName} onSubmit={handleSubmit}>
        <label htmlFor="room-code" className={labelClassName}>Room code</label>
        <input
          id="room-code"
          className={inputClassName}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          aria-required="true"
          maxLength={10}
          disabled={submitting}
        />

        <button
          className={buttonClassName}
          type="submit"
          disabled={!canSubmit}
          data-submitting={submitting || undefined}
        >
          {submitting ? "Joining…" : "Join"}
        </button>
      </form>

      {renderError?.()}
    </div>
  );
}
