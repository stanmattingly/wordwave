"use client";

export default function PowerUps() {
  // TODO: connect to player state for setting amount of gems.
  const playerGems = 9;
  const totalGems = 10;

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg mt-6 p-4 flex flow-row">
      <div className="basis-1/6 lm-2 text-3xl">💀</div>
      <div className="basis-2/6 lm-2 p-2 grid grid-cols-5 gap-1">
        {Array.from({ length: totalGems }, (_, index) => (
          <span key={index} className="w-full h-10 object-cover rounded">
            {index < playerGems ? "💎" : " "}
          </span>
        ))}
      </div>
      <div className="basis-1/6 lm-2 ">
        <button className="relative w-12 h-12 m-1 flex items-center justify-center text-l font-semibold rounded-lg shadow-md transition duration-200 bg-green-600">
          Shuf
        </button>
      </div>
      <div className="basis-1/6 lm-2 ">
        <button className="relative w-12 h-12 m-1 flex items-center justify-center text-l font-semibold rounded-lg shadow-md transition duration-200 bg-green-600">
          Swap
        </button>
      </div>
      <div className="basis-1/6 lm-2 ">
        <button className="relative w-12 h-12 m-1 flex items-center justify-center text-l font-semibold rounded-lg shadow-md transition duration-200 bg-green-600">
          Hint
        </button>
      </div>
    </div>
  );
}
