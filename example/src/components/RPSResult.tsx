const choiceEmoji: Record<string, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

interface RPSResultProps {
  result: {
    winner: number;
    p1Choice: string;
    p2Choice: string;
  };
  playerNames: Record<number, string>;
}

export function RPSResult({ result, playerNames }: RPSResultProps) {
  const name1 = playerNames[1] || "Player 1";
  const name2 = playerNames[2] || "Player 2";

  const winnerText =
    result.winner === 0
      ? "It's a draw!"
      : `${playerNames[result.winner] || `Player ${result.winner}`} wins!`;

  return (
    <div style={{ textAlign: "center" }}>
      <div className="vs-screen">
        <div className="vs-player">
          <div className="vs-player-name">{name1}</div>
          <div className="vs-player-choice">{choiceEmoji[result.p1Choice] || "?"}</div>
          <div className="vs-player-choice-label">{result.p1Choice}</div>
        </div>
        <div className="vs-divider">VS</div>
        <div className="vs-player">
          <div className="vs-player-name">{name2}</div>
          <div className="vs-player-choice">{choiceEmoji[result.p2Choice] || "?"}</div>
          <div className="vs-player-choice-label">{result.p2Choice}</div>
        </div>
      </div>
      <div className={`result-announce ${result.winner === 0 ? "result-draw" : ""}`}>
        {winnerText}
      </div>
    </div>
  );
}
