"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

const CELL = 12;
const COLS = 24;
const ROWS = 20;

type Dir = { x: number; y: number };
type Point = { x: number; y: number };

export default function SnakeWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 6, y: 10 }, { x: 5, y: 10 }, { x: 4, y: 10 }] as Point[],
    dir: { x: 1, y: 0 } as Dir,
    nextDir: { x: 1, y: 0 } as Dir,
    food: { x: 15, y: 10 } as Point,
    score: 0,
    alive: true,
  });
  const [score, setScore] = useState(0);
  const [alive, setAlive] = useState(true);
  const [started, setStarted] = useState(false);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMobile = useIsMobile();

  const placeFood = useCallback((snake: Point[]) => {
    let f: Point;
    do {
      f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === f.x && s.y === f.y));
    return f;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(s.food.x * CELL, s.food.y * CELL, CELL - 1, CELL - 1);

    s.snake.forEach((seg, i) => {
      ctx.fillStyle = s.alive ? (i === 0 ? "#00ff41" : "#00b32c") : "#555";
      ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 1, CELL - 1);
    });

    if (!s.alive) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, ROWS * CELL * 0.35, COLS * CELL, 50);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px VT323, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`GAME OVER — Score: ${s.score}`, (COLS * CELL) / 2, ROWS * CELL * 0.35 + 22);
      ctx.font = "12px VT323, monospace";
      ctx.fillText("Click to restart", (COLS * CELL) / 2, ROWS * CELL * 0.35 + 40);
      ctx.textAlign = "left";
    }

    if (!started) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.fillStyle = "#00ff41";
      ctx.font = "bold 16px VT323, monospace";
      ctx.textAlign = "center";
      ctx.fillText("Tap / Click to Start", (COLS * CELL) / 2, (ROWS * CELL) / 2);
      ctx.textAlign = "left";
    }
  }, [started]);

  const step = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;

    s.dir = s.nextDir;
    const head = {
      x: (s.snake[0].x + s.dir.x + COLS) % COLS,
      y: (s.snake[0].y + s.dir.y + ROWS) % ROWS,
    };

    if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      s.alive = false;
      setAlive(false);
      if (loopRef.current) clearInterval(loopRef.current);
      draw();
      return;
    }

    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 10;
      setScore(s.score);
      s.food = placeFood(s.snake);
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw, placeFood]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 6, y: 10 }, { x: 5, y: 10 }, { x: 4, y: 10 }];
    s.dir = { x: 1, y: 0 };
    s.nextDir = { x: 1, y: 0 };
    s.food = placeFood(s.snake);
    s.score = 0;
    s.alive = true;
    setScore(0);
    setAlive(true);
    setStarted(true);
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(step, 130);
  }, [step, placeFood]);

  useEffect(() => {
    draw();
  }, [draw]);

  const changeDir = useCallback((nd: Dir) => {
    const s = stateRef.current;
    if (!s.alive) return;
    if (nd.x !== -s.dir.x || nd.y !== -s.dir.y) {
      s.nextDir = nd;
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started) { startGame(); return; }
      const map: Record<string, Dir> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const nd = map[e.key];
      if (nd) { changeDir(nd); e.preventDefault(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, startGame, changeDir]);

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  const dpadBtn = (label: string, dir: Dir) => (
    <button
      className="win95-btn"
      onPointerDown={(e) => {
        e.preventDefault();
        if (!started || !alive) { startGame(); return; }
        changeDir(dir);
      }}
      style={{ width: 44, height: 44, minWidth: 0, fontSize: 16, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#c0c0c0",
        gap: 8,
        padding: 12,
        overflowY: "auto",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: "bold", fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        Score: {score}
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        style={{ border: "2px inset #808080", cursor: "pointer", display: "block", touchAction: "none" }}
        onClick={() => { if (!started || !alive) startGame(); canvasRef.current?.focus(); }}
        onTouchStart={(e) => {
          touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touchStartRef.current) return;
          const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
          const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
          touchStartRef.current = null;
          if (!started || !alive) { startGame(); return; }
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            changeDir(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
          } else {
            changeDir(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
          }
        }}
        tabIndex={0}
      />

      {isMobile && (
        <div style={{ display: "grid", gridTemplateColumns: "44px 44px 44px", gridTemplateRows: "44px 44px 44px", gap: 4, marginTop: 4 }}>
          <div />
          {dpadBtn("▲", { x: 0, y: -1 })}
          <div />
          {dpadBtn("◄", { x: -1, y: 0 })}
          <div style={{ background: "#b0b0b0", border: "2px inset #808080", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#555" }}>●</div>
          {dpadBtn("►", { x: 1, y: 0 })}
          <div />
          {dpadBtn("▼", { x: 0, y: 1 })}
          <div />
        </div>
      )}

      <div style={{ fontSize: 10, color: "#555", fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        {isMobile
          ? (started ? "Swipe or use buttons" : "Tap canvas to start")
          : (started ? "Arrow keys to control" : "Click canvas to start")}
      </div>
    </div>
  );
}
