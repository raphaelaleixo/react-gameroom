import React, { useState } from "react";

/**
 * Customizable labels for JoinGame form text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface JoinGameLabels {
  /** Label text for the room code input (default: "Room code"). */
  label?: string;
  /** Placeholder text for the input (default: "Enter room code"). */
  placeholder?: string;
  /** Submit button text (default: "Join"). */
  submit?: string;
  /** Submit button text while submitting (default: "Joining…"). */
  submitting?: string;
}

const defaultLabels: Required<JoinGameLabels> = {
  label: "Room code",
  placeholder: "Enter room code",
  submit: "Join",
  submitting: "Joining…",
};

export interface JoinGameProps {
  onJoin: (roomCode: string) => void | Promise<void>;
  renderError?: () => React.ReactNode;
  className?: string;
  formClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  /** Custom labels for form text. */
  labels?: JoinGameLabels;
}

export function JoinGame({ onJoin, renderError, className, formClassName, labelClassName, inputClassName, buttonClassName, labels: labelsProp }: JoinGameProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = code.trim().length > 0 && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onJoin(code.trim().toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <form className={formClassName} onSubmit={handleSubmit}>
        <label htmlFor="room-code" className={labelClassName}>{labels.label}</label>
        <input
          id="room-code"
          className={inputClassName}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={labels.placeholder}
          aria-required="true"
          maxLength={10}
          disabled={isSubmitting}
        />

        <button
          className={buttonClassName}
          type="submit"
          disabled={!canSubmit}
          data-submitting={isSubmitting || undefined}
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </button>
      </form>

      {renderError?.()}
    </div>
  );
}
