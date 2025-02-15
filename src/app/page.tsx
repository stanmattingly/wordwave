// pages/index.tsx
"use client";

import { useState } from "react";
import GameBoard from "./components/Gameboard";
import Lobby from "./components/Lobby";

interface Player {
  id: number;
  name: string;
  points: number;
  isActive: boolean;
}

export default function Home() {
  // TODO: functions: startGame, nextTurn, nextRound
  // TODO: Pass props to GameBoard

  const totalRounds = 5;
  const [roundNumber, setRoundNumber] = useState(0);

  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Alice", points: 5, isActive: true },
    { id: 2, name: "Bill", points: 8, isActive: false },
    { id: 3, name: "Stan", points: 0, isActive: false },
  ]);

  const handleIt = () => {
    console.log("yo");
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-6">Word Wave!</h1>

      <div className="grid grid-cols-12 gap-2">
        {/* Left spacer to center the GameBoard */}
        <div className="col-span-1">
          <button onMouseDown={() => handleIt()}>yo</button>
        </div>

        <div className="col-span-8">
          <GameBoard />
        </div>

        <div className="col-span-3">
          <Lobby roundNumber={roundNumber} players={players} />
        </div>
      </div>
    </div>
  );
}