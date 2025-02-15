// pages/index.tsx or components/Home.tsx
import Image from "next/image";
import GameBoard from "@/app/components/Gameboard";
import Lobby from "@/app/components/Lobby";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-6">Word Wave!</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* Left spacer to center the GameBoard */}
        <div className="col-span-2"></div>

        {/* GameBoard component with max width of 6 columns */}
        <div className="col-span-6">
          <GameBoard />
        </div>

        {/* Lobby component with width of 2 columns, automatically positioned right */}
        <div className="col-span-2">
          <Lobby />
        </div>

        {/* Right spacer to balance the layout */}
        <div className="col-span-2"></div>
      </div>
    </div>
  );
}
