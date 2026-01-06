"use client";
import dynamic from "next/dynamic";

const GameClient = dynamic(() => import("./GameClient"), {
  ssr: false,
});

export default function GamePage() {
  return (
    <main className="min-h-screen bg-black">
      <GameClient />
    </main>
  );
}
