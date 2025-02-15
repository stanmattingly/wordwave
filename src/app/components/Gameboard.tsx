export default function GameBoard() {
    const letters = [
      ["A", "B", "C", "D", "E"],
      ["F", "G", "H", "I", "J"],
      ["K", "L", "M", "N", "O"],
      ["P", "Q", "R", "S", "T"],
      ["U", "V", "W", "X", "Y"],
    ];
  
    return (
      <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center">
        {/* Header */}
        <header className="text-3xl font-bold text-center mb-4">SpellCast</header>
  
        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-2 bg-gray-700 p-4 rounded-lg">
          {letters.flat().map((letter, index) => (
            <div
              key={index}
              className="w-12 h-12 flex items-center justify-center text-xl font-semibold bg-gray-600 rounded-lg shadow-md"
            >
              {letter}
            </div>
          ))}
        </div>
  
        {/* Footer */}
        <footer className="mt-4 text-gray-300">Your Turn!</footer>
      </div>
    );
  }
  