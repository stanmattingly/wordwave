"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { letterPoints } from "../components/utils";
import CanvasOverlay from "../components/CanvasOverlay"; // Adjust the path as necessary

import { useGameWebSocket } from "../hooks/useGameWebSocket";

interface GameBoardProps {
  boardState: string[][];
}

export default function GameBoard({ boardState }: GameBoardProps) {
  const { sendGameMessage, playerId, currentRoom } = useGameWebSocket();

  const [selectedLetters, setSelectedLetters] = useState<
    { letter: string; pos: number }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [wordCheck, setWordCheck] = useState<string>();
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [currentScore, setCurrentScore] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getLetterPosition = (index: number) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const tileSize = 60;
    const offset = 16; // Button padding + border, adjust as needed
    return {
      x: col * tileSize + tileSize / 2 + offset, // Centering
      y: row * tileSize + tileSize / 2 + offset, // Centering
    };
  };

  useEffect(() => {
    fetch("/dictionary/filteredWords.txt")
      .then((response) => response.text())
      .then((text) => {
        setDictionary(new Set(text.split("\n").map((word) => word.trim())));
      });
  }, []);

  const handleMouseDown = (letter: string, index: number) => {
    setSelectedLetters([{ letter, pos: index }]);
    setIsDragging(true);
  };

  const isAdjacent = (currentIndex: number, lastIndex: number) => {
    const currentRow = Math.floor(currentIndex / 5);
    const currentCol = currentIndex % 5;
    const lastRow = Math.floor(lastIndex / 5);
    const lastCol = lastIndex % 5;
    return (
      Math.abs(currentRow - lastRow) <= 1 && Math.abs(currentCol - lastCol) <= 1
    );
  };

  const handleMouseEnter = (letter: string, index: number) => {
    if (isDragging) {
      const lastIndex = selectedLetters.length - 1;
      const lastSelected = selectedLetters[lastIndex];

      if (
        lastSelected &&
        lastIndex > 0 &&
        selectedLetters[lastIndex - 1].pos === index
      ) {
        setSelectedLetters(selectedLetters.slice(0, lastIndex));
      } else if (lastSelected && isAdjacent(index, lastSelected.pos)) {
        if (!selectedLetters.some((selected) => selected.pos === index)) {
          setSelectedLetters([...selectedLetters, { letter, pos: index }]);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const formedWord = selectedLetters
      .map((x) => x.letter)
      .join("")
      .toLowerCase()
      .trim(); // ✅ Ensure no spaces

    if (dictionary.has(formedWord)) {
      let wordScore = selectedLetters.reduce(
        (sum, { letter }) => sum + (letterPoints[letter] || 0),
        0
      );

      // ✅ Update local score before sending to server
      const newScore = currentScore + wordScore;
      setCurrentScore(newScore);
      setWordCheck(`${formedWord}: ${wordScore}`);

      // ✅ Notify the server about the player's score
      sendGameMessage("player_score_update", {
        playerId,
        points: newScore,
      });

      // ✅ Notify the server to proceed with the next turn
      sendGameMessage("turn_update", {
        turnIndex: (currentRoom?.turnIndex ?? 0) + 1,
      });

      // ✅ Clear selected letters after a successful word
      setSelectedLetters([]);
    } else {
      setSelectedLetters([]);
      setWordCheck(`❌${formedWord}❌`);
    }
  };

  return (
    <div
      className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
      onMouseUp={handleMouseUp}
    >
      <header className="text-3xl font-bold text-center mb-4 px-6 py-2 bg-gray-700 rounded-lg shadow-md selectedLetters">
        {selectedLetters.length > 0
          ? selectedLetters.map((x) => x.letter).join("")
          : " "}
      </header>
      <div className="relative">
        <CanvasOverlay
          selectedLetters={selectedLetters}
          getLetterPosition={getLetterPosition}
        />

        {boardState.length > 0 ? (
          <div className="grid grid-cols-5 gap-1 bg-gray-700 p-4 rounded-lg">
            {boardState.flat().map((letter, index) => (
              <button
                key={index}
                onMouseDown={() => handleMouseDown(letter, index)}
                onMouseEnter={() => handleMouseEnter(letter, index)}
                className={`relative z-10 w-12 h-12 m-1 flex items-center justify-center text-xl font-semibold rounded-lg shadow-md transition duration-200 
                ${
                  selectedLetters.find((x) => x.pos === index)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-600 hover:bg-gray-500"
                }
              `}
              >
                {letter}
                <span className="absolute bottom-1 right-1 text-xs">
                  {letterPoints[letter]}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p>Loading... boardState: {JSON.stringify(boardState)}</p>
        )}
      </div>

      <footer className="text-3xl font-bold text-center px-6 py-2 bg-gray-700 rounded-lg shadow-md mt-4 text-gray-300  selectedLetters">
        {wordCheck}
      </footer>
    </div>
  );
}
