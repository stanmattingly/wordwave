"use client";

import { useState } from "react";

export default function GameBoard() {
  const letters = [
    ["A", "B", "C", "D", "E"],
    ["F", "G", "H", "I", "J"],
    ["K", "L", "M", "N", "O"],
    ["P", "Q", "R", "S", "T"],
    ["U", "V", "W", "X", "Y"],
  ];

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
      <div className="grid grid-cols-5 gap-2 bg-gray-700 p-4 rounded-lg">
        {letters.flat().map((letter, index) => (
          <button
            key={index}
            className={`w-12 h-12 flex items-center justify-center text-xl font-semibold rounded-lg shadow-md transition duration-200 
              ${selectedLetters.includes(letter) ? "bg-blue-500 text-white" : "bg-gray-600 hover:bg-gray-500"}
            `}
            onMouseDown={() => handleMouseDown(letter)}
            onMouseEnter={() => handleMouseEnter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-3xl font-bold text-center px-6 py-2 bg-gray-700 rounded-lg shadow-md mt-4 text-gray-300">POWERUPS?</footer>
    </div>
  );
}
