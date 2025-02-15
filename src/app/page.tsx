// pages/index.tsx
"use client";

import { useState } from "react";
import GameBoard from "@/app/components/Gameboard";
import Lobby from "@/app/components/Lobby";

export default function Home() {
  // TODO: Game Controller functions: startGame, nextTurn, nextRound, setPlayerScore
  // TODO: Pass props to GameBoard and Lobby

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
          <Lobby />
        </div>
      </div>
    </div>
  );
}
