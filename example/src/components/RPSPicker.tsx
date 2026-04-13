type Choice = "rock" | "paper" | "scissors";

interface RPSPickerProps {
  onPick: (choice: Choice) => void;
  disabled: boolean;
}

const choices: { value: Choice; emoji: string }[] = [
  { value: "rock", emoji: "✊" },
  { value: "paper", emoji: "✋" },
  { value: "scissors", emoji: "✌️" },
];

export function RPSPicker({ onPick, disabled }: RPSPickerProps) {
  return (
    <div className="rps-picker">
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          className="rps-btn"
          onClick={() => onPick(c.value)}
          disabled={disabled}
          title={c.value}
        >
          {c.emoji}
        </button>
      ))}
    </div>
  );
}
