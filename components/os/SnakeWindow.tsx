"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
      ctx.fillText("Click to Start", (COLS * CELL) / 2, (ROWS * CELL) / 2 - 8);
      ctx.font = "12px VT323, monospace";
      ctx.fillStyle = "#808080";
      ctx.fillText("Arrow keys to move", (COLS * CELL) / 2, (ROWS * CELL) / 2 + 12);
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started) { startGame(); return; }
      const s = stateRef.current;
      const map: Record<string, Dir> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const nd = map[e.key];
      if (nd && (nd.x !== -s.dir.x || nd.y !== -s.dir.y)) {
        s.nextDir = nd;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, startGame]);

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

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
      }}
    >
      <div style={{ fontSize: 11, fontWeight: "bold", fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        Score: {score}
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        style={{ border: "2px inset #808080", cursor: "pointer", display: "block" }}
        onClick={() => {
          if (!started || !alive) startGame();
          canvasRef.current?.focus();
        }}
        tabIndex={0}
      />
      <div style={{ fontSize: 10, color: "#555", fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        {started ? "Arrow keys to control" : "Click canvas to start"}
      </div>
    </div>
  );
}
