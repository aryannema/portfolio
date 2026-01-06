"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

class DemoScene extends Phaser.Scene {
  constructor() {
    super("demo");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 10, "PORTFOLIO GAME SHELL", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 24, "Phaser + Next.js working ✅", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);
  }
}

export default function GameClient() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#000000",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 540,
      },
      scene: [DemoScene],
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-screen w-screen" />;
}
