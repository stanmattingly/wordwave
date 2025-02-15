"use client";

import { useState } from "react";

interface Player {
    id: number;
    name: string;
    points: number;
    isActive: boolean; // To determine whose turn it is
}

export default function Lobby() {
    const [roundNumber, setRoundNumber] = useState(0);
    const [players, setPlayers] = useState<Player[]>([
        { id: 1, name: "Alice", points: 5, isActive: true },
        { id: 2, name: "Bob", points: 8, isActive: false },
        { id: 3, name: "Charlie", points: 3, isActive: false },
    ]);
    const totalRounds = 5;

    return (
        <div className="p-4">
            <div className="text-lg font-bold">Round {roundNumber}/{totalRounds}</div>
            <div className="flex flex-col mt-4">
                {players.map(player => (
                    <div key={player.id} className={`flex items-center space-x-3 p-2 ${player.isActive ? 'bg-green-200' : 'bg-white'}`}>
                        <div className="flex-1">
                            <div className="font-semibold">{player.name}</div>
                            <div>Points: {player.points}</div>
                        </div>
                        {player.isActive && <div className="text-green-500 font-bold">Your Turn!</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}