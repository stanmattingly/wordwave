// WordScored.tsx
import React from "react";

interface WordScoredProps {
  word: string;
  score: number;
}

const WordScored: React.FC<WordScoredProps> = ({ word, score }) => {
  return (
    <div className="word-scored-container">
      <div className="word-scored-popup">
        <p className="word-scored-word text-5xl m-4 font-bold text-center">
          {word.toUpperCase()}
        </p>
        <p className="word-scored-score text-4xl font-bold text-center">
          {score}
        </p>
      </div>
    </div>
  );
};

export default WordScored;
