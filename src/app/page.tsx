// pages/index.tsx or components/Home.tsx
import Image from "next/image";
import GameBoard from "@/app/components/Gameboard";
import Lobby from "@/app/components/Lobby";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-6">Word Wave!</h1>

      <div className="grid grid-cols-12 gap-2">
        {/* Left spacer to center the GameBoard */}
        <div className="col-span-1"></div>

        <div className="col-span-8">
          <GameBoard />
        </div>

        <div className="col-span-3">
          <Lobby />
        </div>
      </div>
    </div>
  );
}
