// components/Lobby.tsx
"use client";

import { useState } from "react";

interface Player {
  id: number;
  name: string;
  points: number;
  isActive: boolean;
}

interface LobbyProps {
  roundNumber: number;
  players: Player[];
}

const Lobby: React.FC<LobbyProps> = ({ roundNumber, players }) => {
  const totalRounds = 5;

  // TODO: setPlayers from websocket

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg mt-6">
      <div className="text-2xl font-bold text-center font-bold pt-4">
        Round {roundNumber}/{totalRounds}
      </div>
      <div className="flex flex-col mt-2 ">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center space-x-3 p-2 m-3 rounded-lg ${
              player.isActive ? "bg-green-400" : "bg-gray-600"
            }`}
          >
            <div className="flex-1">
              <div className="font-semibold">{player.name}</div>
              <div>{player.points}</div>
            </div>
            {player.isActive && (
              <div className="text-red-500 font-bold">🎲</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
