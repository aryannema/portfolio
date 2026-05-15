"use client";

import { useState, useCallback } from "react";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number };
type GameState = "idle" | "playing" | "won" | "lost";

function createBoard(): CellState[][] {
  const board: CellState[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }))
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].mine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr; const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++;
          }
        board[r][c].adjacent = count;
      }
    }
  }
  return board;
}

const NUM_COLORS = ["", "#0000ff","#008000","#ff0000","#000080","#800000","#008080","#000","#808080"];

export default function MinesweeperWindow() {
  const [board, setBoard] = useState<CellState[][]>(() => createBoard());
  const [gameState, setGameState] = useState<GameState>("idle");
  const [minesLeft, setMinesLeft] = useState(MINES);
  const [time, setTime] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  const reveal = useCallback((board: CellState[][], r: number, c: number): CellState[][] => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return board;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return board;
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    newBoard[r][c].revealed = true;
    if (newBoard[r][c].adjacent === 0 && !newBoard[r][c].mine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) reveal(newBoard, r + dr, c + dc);
    }
    return newBoard;
  }, []);

  const startTimer = useCallback(() => {
    setTime(0);
    if (timerRef) clearInterval(timerRef);
    const t = setInterval(() => setTime((prev) => prev + 1), 1000);
    setTimerRef(t);
    return t;
  }, [timerRef]);

  const handleClick = useCallback((r: number, c: number) => {
    if (gameState === "won" || gameState === "lost") return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    let t: ReturnType<typeof setInterval> | null = null;
    if (gameState === "idle") { t = startTimer(); setGameState("playing"); }

    if (cell.mine) {
      if (t) clearInterval(t);
      else if (timerRef) clearInterval(timerRef);
      setGameState("lost");
      setBoard((prev) => prev.map((row) => row.map((c) => ({ ...c, revealed: c.mine ? true : c.revealed }))));
      return;
    }

    const newBoard = reveal(board, r, c);
    const unrevealed = newBoard.flat().filter((c) => !c.revealed && !c.mine).length;
    if (unrevealed === 0) {
      if (t) clearInterval(t);
      else if (timerRef) clearInterval(timerRef);
      setGameState("won");
    }
    setBoard(newBoard);
  }, [board, gameState, reveal, startTimer, timerRef]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState === "won" || gameState === "lost") return;
    const cell = board[r][c];
    if (cell.revealed) return;
    setBoard((prev) => {
      const nb = prev.map((row) => row.map((c) => ({ ...c })));
      nb[r][c].flagged = !nb[r][c].flagged;
      return nb;
    });
    setMinesLeft((prev) => prev + (cell.flagged ? 1 : -1));
  }, [board, gameState]);

  const reset = () => {
    if (timerRef) clearInterval(timerRef);
    setBoard(createBoard());
    setGameState("idle");
    setMinesLeft(MINES);
    setTime(0);
  };

  const faceEmoji = gameState === "lost" ? "😵" : gameState === "won" ? "😎" : "🙂";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#c0c0c0", padding: 12 }}>
      <div style={{ border: "3px solid", borderColor: "#fff #808080 #808080 #fff" }}>
        {/* Header */}
        <div style={{ background: "#c0c0c0", padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px inset #808080" }}>
          <div style={{ border: "2px inset #808080", background: "#000", color: "#f00", fontFamily: "Courier New", fontSize: 18, padding: "2px 6px", minWidth: 40, textAlign: "right" }}>
            {String(minesLeft).padStart(3, "0")}
          </div>
          <button onClick={reset} style={{ background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", width: 26, height: 26, fontSize: 14, cursor: "pointer" }}>
            {faceEmoji}
          </button>
          <div style={{ border: "2px inset #808080", background: "#000", color: "#f00", fontFamily: "Courier New", fontSize: 18, padding: "2px 6px", minWidth: 40, textAlign: "right" }}>
            {String(Math.min(time, 999)).padStart(3, "0")}
          </div>
        </div>

        {/* Board */}
        <div style={{ padding: 6, border: "3px inset #808080" }}>
          {board.map((row, r) => (
            <div key={r} style={{ display: "flex" }}>
              {row.map((cell, c) => (
                <div
                  key={c}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                  style={{
                    width: 20, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: "bold", cursor: "pointer",
                    fontFamily: "MS Sans Serif, Arial, sans-serif",
                    background: "#c0c0c0",
                    border: cell.revealed ? "1px solid #808080" : "2px solid",
                    borderColor: cell.revealed ? "#808080" : "#fff #808080 #808080 #fff",
                    color: cell.adjacent > 0 ? NUM_COLORS[cell.adjacent] : "#000",
                  }}
                >
                  {cell.flagged && !cell.revealed ? "🚩" : cell.revealed ? (cell.mine ? "💣" : cell.adjacent > 0 ? cell.adjacent : "") : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {gameState === "won" && <div style={{ marginTop: 8, fontWeight: "bold", fontSize: 11, color: "#008000" }}>You won! 🎉</div>}
      {gameState === "lost" && <div style={{ marginTop: 8, fontWeight: "bold", fontSize: 11, color: "#800000" }}>Game over! Click 🙂 to retry.</div>}
      <div style={{ marginTop: 6, fontSize: 10, color: "#555", fontFamily: "MS Sans Serif, Arial, sans-serif" }}>Right-click to flag mines</div>
    </div>
  );
}
