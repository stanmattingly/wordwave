// HostControls.tsx
import React from "react";

interface HostControlsProps {
  isHost: boolean;
  startGame: () => void;
  nextTurn: () => void;
  nextRound: () => void;
}

const HostControls: React.FC<HostControlsProps> = ({
  isHost,
  startGame,
  nextTurn,
  nextRound,
}) => {
  if (!isHost) return null;

  return (
    <div className="text-center">
      <button
        onClick={startGame}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Game
      </button>
      <button
        onClick={nextTurn}
        className="bg-green-500 text-white px-4 py-2 rounded ml-2"
      >
        Next Turn
      </button>
      <button
        onClick={nextRound}
        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
      >
        Next Round
      </button>
    </div>
  );
};

export default HostControls;
