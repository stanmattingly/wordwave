"use client";

interface Player {
  id: string;
  name: string;
  points: number;
  isActive: boolean;
}

interface LobbyProps {
  roundNumber: number;
  players?: Player[]; // ✅ Made optional to prevent undefined errors
}

const totalRounds = 5;

const Lobby: React.FC<LobbyProps> = ({ roundNumber, players = [] }) => {
  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg mt-6 p-4">
      <div className="text-2xl font-bold text-center">
        Round {roundNumber}/{totalRounds}
      </div>
      <div className="flex flex-col mt-2">
        {players.length === 0 ? (
          <p className="text-center text-gray-400">Waiting for players...</p>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center space-x-3 p-2 m-3 rounded-lg ${player.isActive ? "bg-green-400" : "bg-gray-600"
                }`}
            >
              <div className="flex-1">
                <div className="font-semibold">{player.name}</div>
                <div>{player.points} pts</div>
              </div>
              {player.isActive && <div className="text-red-500 font-bold">🎲</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Lobby;
