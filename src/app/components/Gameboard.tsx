"use client";
import { useState, useEffect } from "react";

export default function GameBoard() {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [wordCheck, setWordCheck] = useState<string>();
  const [letterLayout, setLetterLayout] = useState<string[][]>([]);
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [currentScore, setCurrentScore] = useState<number>(0);

  const letterPoints: { [key: string]: number } = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10,
  };

  const generateRandomLayout = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    return Array.from({ length: 5 }, (_, i) =>
      shuffled.slice(i * 5, i * 5 + 5)
    );
  };

  // Generate grid only after component mounts (avoiding server mismatch)
  useEffect(() => {
    setLetterLayout(generateRandomLayout());

    // get local dictionary
    fetch("/dictionary/filteredWords.txt")
      .then((response) => response.text())
      .then((text) => {
        setDictionary(new Set(text.split("\n")));
      });
  }, []);

  const startNewGame = () => {
    setLetterLayout(generateRandomLayout());
  };

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
    const formedWord = selectedLetters.join("").toLowerCase();
    if (dictionary.has(formedWord)) {
      let wordScore = 0;
      for (const letter of selectedLetters) {
        wordScore += letterPoints[letter as keyof typeof letterPoints];
      }
      setCurrentScore((prevScore) => prevScore + wordScore);
      setWordCheck(`${formedWord}: ${wordScore}`);
      console.log("Valid word! Score:", wordScore);
    } else {
      setWordCheck("Invalid word!");
      console.log("Invalid word!");
    }
  };

  return (
    <div
      className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
      onMouseUp={handleMouseUp} // Handle mouse release
    >
      {/* Header dynamically updating with selected letters */}
      <header className="text-3xl font-bold text-center mb-4 px-6 py-2 bg-gray-700 rounded-lg shadow-md">
        {selectedLetters.length > 0 ? selectedLetters.join("") : ""}
      </header>

      {/* 5x5 Grid with buttons */}
      {/* Ensure we only render the grid once it's generated */}
      {letterLayout.length > 0 ? (
        <div className="grid grid-cols-5 gap-2 bg-gray-700 p-4 rounded-lg">
          {letterLayout.flat().map((letter, index) => (
            <button
              key={index}
              className={`relative w-12 h-12 flex items-center justify-center text-xl font-semibold rounded-lg shadow-md transition duration-200 
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
              <span className="absolute bottom-1 right-1 text-xs">
                {letterPoints[letter]}
              </span>
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
        {wordCheck}
      </footer>
    </div>
  );
}
