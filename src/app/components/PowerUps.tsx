"use client";

export default function PowerUps() {
  // TODO: connect to player state for setting amount of gems, isWinning.
  const playerGems = 9;
  const totalGems = 10;
  const isWinning = false;

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg mt-6 pt-3 flex flow-row">
      <div className="basis-1/6 lm-2 text-3xl p-5">
        {isWinning ? "👑" : "💀"}
      </div>
      <div className="basis-2/6 lm-2 p-2 grid grid-cols-5 gap-1">
        {Array.from({ length: totalGems }, (_, index) => (
          <span key={index} className="w-full h-8 object-cover rounded">
            {index < playerGems ? "💎" : " "}
          </span>
        ))}
      </div>
      <div className="basis-1/6 lm-2 ">
        <button className="relative w-16 h-16 m-1 flex items-center justify-center text-l font-semibold rounded-lg shadow-md transition duration-200 bg-blue-500">
          Shuffle
        </button>
      </div>
      <div className="basis-1/6 lm-2 ">
        <button className="relative w-16 h-16 m-1 flex items-center justify-center text-l font-semibold rounded-lg shadow-md transition duration-200 bg-blue-500">
          Swap
        </button>
      </div>
      <div className="basis-1/6 lm-2 ">
        <button className="relative w-16 h-16 m-1 flex items-center justify-center text-l font-semibold rounded-lg shadow-md transition duration-200 bg-blue-500">
          Hint
        </button>
      </div>
    </div>
  );
}
