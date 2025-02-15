"use client";

import { useEffect, useState } from "react";
import GameBoard from "./components/Gameboard";
import Lobby from "./components/Lobby";
import { useGameWebSocket } from "./hooks/useGameWebSocket";

type GameMessage = {
  type:
    | "room_joined"
    | "room_updated"
    | "gameboard_update"
    | "turn_update"
    | "round_update"
    | "player_score_update"
    | "connected"
    | "error";
  content?: {
    board?: string[][];
    turnIndex?: number;
    roundNumber?: number;
    playerId?: string;
    points?: number;
  };
};

export default function Home() {
  const {
    currentRoom,
    playerId,
    isHost,
    sendGameMessage,
    messages,
    isConnected,
  } = useGameWebSocket();

  const totalRounds = 5;
  const [roundNumber, setRoundNumber] = useState(1);
  const [players, setPlayers] = useState<
    { id: string; name: string; points: number; isActive: boolean }[]
  >([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [boardState, setBoardState] = useState<string[][]>([]);

  // 🔹 Generate a random board
  const generateRandomBoard = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    return Array.from({ length: 5 }, (_, i) =>
      shuffled.slice(i * 5, i * 5 + 5)
    );
  };

  // 🔹 Update game state when room updates
  useEffect(() => {
    if (!currentRoom) return;

    setPlayers(
      currentRoom.players?.map((p, index) => ({
        id: p.id,
        name: `Player ${p.id}`,
        points: p.points,
        isActive: index === currentRoom.turnIndex,
      }))
    );

    setTurnIndex(currentRoom.turnIndex);
    setRoundNumber(currentRoom.roundNumber || 1);

    if (currentRoom.boardState && currentRoom.boardState.length > 0) {
      setBoardState(currentRoom.boardState);
    }
  }, [currentRoom]);

  // 🔹 Handle incoming WebSocket messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    messages.forEach((msg: GameMessage) => {
      if (!msg.content) return;

      switch (msg.type) {
        case "round_update":
          if (msg.content.roundNumber !== undefined) {
            setRoundNumber(msg.content.roundNumber);
          }
          setTurnIndex(0);
          break;

        case "turn_update":
          if (msg.content.turnIndex !== undefined) {
            setTurnIndex(msg.content.turnIndex);
            setPlayers((prevPlayers) =>
              prevPlayers.map((p, index) => ({
                ...p,
                isActive: index === msg.content!.turnIndex,
              }))
            );
          }
          break;

        case "gameboard_update":
          if (msg.content.board) {
            console.log("🛠 Updating game board:", msg.content.board);
            setBoardState(msg.content.board);
          }
          break;

        case "player_score_update":
          if (
            msg.content.playerId !== undefined &&
            msg.content.points !== undefined
          ) {
            setPlayers((prevPlayers) =>
              prevPlayers.map((p) =>
                p.id === msg.content!.playerId
                  ? { ...p, points: msg.content!.points ?? p.points } // ✅ Fix: Ensure points is a number
                  : p
              )
            );
          }
          break;

        default:
          break;
      }
    });
  }, [messages]);

  // 🔹 Ensure board is generated when the game starts
  const startGame = () => {
    if (isHost && players.length > 0) {
      const newBoard = generateRandomBoard();
      console.log("🎲 Generating board for new game:", newBoard);
      sendGameMessage("gameboard_update", { board: newBoard });
      sendGameMessage("game_start", {});
    }
  };

  const nextTurn = () => {
    if (isHost && players.length > 0) {
      let newTurnIndex = (turnIndex + 1) % players.length;

      if (newTurnIndex === 0) {
        // All players have gone, advance to next round
        nextRound();
      } else {
        sendGameMessage("turn_update", { turnIndex: newTurnIndex });
      }
    }
  };

  const nextRound = () => {
    if (isHost && players.length > 0) {
      if (roundNumber < totalRounds) {
        sendGameMessage("round_update", { roundNumber: roundNumber + 1 });
      } else {
        console.log("🏆 Game Over! Resetting game...");
        resetGame();
      }
    }
  };

  const resetGame = () => {
    setRoundNumber(1);
    setTurnIndex(0);
    sendGameMessage("game_reset", {});
  };

  return (
    <div className="container mx-auto px-4">
      <div className="logo-container">
        <h2 className="text-3xl font-bold text-center logo-front">WordWave</h2>
        <h2 className="text-3xl font-bold text-center logo-back">WordWave</h2>
      </div>

      {isHost && (
        <div className="text-center">
          <button
            onClick={startGame}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={players.length === 0}
          >
            Start Game
          </button>
          <button
            onClick={nextTurn}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            disabled={players.length === 0}
          >
            Next Turn
          </button>
          <button
            onClick={nextRound}
            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            disabled={players.length === 0}
          >
            Next Round
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-4">
        {/* GameBoard with board state */}
        <div className="md:col-span-8 col-span-1">
          <GameBoard boardState={boardState} />
        </div>

        {/* Lobby with player list and round number */}
        <div className="md:col-span-3 col-span-1">
          <Lobby roundNumber={roundNumber} players={players} />
        </div>
      </div>

      {/* Connection status */}
      <div className="text-center mt-4">
        {isConnected ? (
          <p className="text-green-500">Connected to Game</p>
        ) : (
          <p className="text-red-500">Not Connected</p>
        )}
      </div>
    </div>
  );
}
