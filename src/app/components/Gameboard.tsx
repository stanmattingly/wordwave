"use client";

import { useState, useEffect } from "react";

export default function GameBoard() {
  const generateRandomLayout = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    return Array.from({ length: 5 }, (_, i) =>
      shuffled.slice(i * 5, i * 5 + 5)
    );
  };

  const [letterLayout, setLetterLayout] = useState<string[][]>([]);

  // Generate grid only after component mounts (avoiding server mismatch)
  useEffect(() => {
    setLetterLayout(generateRandomLayout());
  }, []);

  const startNewGame = () => {
    setLetterLayout(generateRandomLayout());
  };

  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (letter: string) => {
    setSelectedLetters([letter]); // Start new selection
    setIsDragging(true);
  };

  const handleMouseEnter = (letter: string) => {
    if (isDragging && !selectedLetters.includes(letter)) {
      setSelectedLetters((prev) => [...prev, letter]); // Add letter to chain
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    console.log("Selected Word:", selectedLetters.join(""));

    // Here we could add validation logic for words
    // TODO: Find dictionary package
  };

  return (
    <div
      className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
      onMouseUp={handleMouseUp} // Handle mouse release
    >
      {/* Header dynamically updating with selected letters */}
      <header className="text-3xl font-bold text-center mb-4 px-6 py-2 bg-gray-700 rounded-lg shadow-md">
        {selectedLetters.length > 0 ? selectedLetters.join("") : "SpellCast"}
      </header>

      {/* 5x5 Grid with buttons */}
      {/* Ensure we only render the grid once it's generated */}
      {letterLayout.length > 0 ? (
        <div className="grid grid-cols-5 gap-2 bg-gray-700 p-4 rounded-lg">
          {letterLayout.flat().map((letter, index) => (
            <button
              key={index}
              className={`w-12 h-12 flex items-center justify-center text-xl font-semibold rounded-lg shadow-md transition duration-200 
                ${
                  selectedLetters.includes(letter)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-600 hover:bg-gray-500"
                }
                `}
              onMouseDown={() => handleMouseDown(letter)}
              onMouseEnter={() => handleMouseEnter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* New Game Button */}
      <button
        onClick={startNewGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        New Game
      </button>

      {/* Footer */}
      <footer className="text-3xl font-bold text-center px-6 py-2 bg-gray-700 rounded-lg shadow-md mt-4 text-gray-300">
        POWERUPS?
      </footer>
    </div>
  );
}
