import Image from "next/image";
import GameBoard from "@/app/components/Gameboard";

export default function Home() {
  return (
    <div>
      <h1>Word Wave!</h1>

      <GameBoard />

    </div>
  );
}
