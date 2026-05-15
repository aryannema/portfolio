"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWindowManager, WindowId } from "./WindowManager";
import { Profile } from "@/types";
import { playClick, playError } from "@/lib/sounds";

interface Line {
  text: string;
  color?: string;
}

const PROMPT = "C:\\DEVOS> ";

const HELP_TEXT: Line[] = [
  { text: "" },
  { text: "Available commands:", color: "#ffff00" },
  { text: "  about       Open About Me window" },
  { text: "  skills      Open Skills.txt" },
  { text: "  projects    Open Projects folder" },
  { text: "  contact     Open Contact.exe" },
  { text: "  resume      Open Resume.pdf" },
  { text: "  snake       Launch Snake.exe" },
  { text: "  minesweeper Launch Minesweeper" },
  { text: "  virus       Run VirusScan 98" },
  { text: "" },
  { text: "  whoami      Display owner info" },
  { text: "  dir         List desktop contents" },
  { text: "  date        Show current date/time" },
  { text: "  ver         Show OS version" },
  { text: "  echo <msg>  Print message to screen" },
  { text: "  cls         Clear screen" },
  { text: "  exit        Close terminal" },
  { text: "" },
];

const DIR_LISTING: Line[] = [
  { text: "" },
  { text: " Volume in drive C is DEVOS_98", color: "#c0c0c0" },
  { text: " Volume Serial Number is 1337-D3V", color: "#c0c0c0" },
  { text: "" },
  { text: " Directory of C:\\DEVOS\\Desktop", color: "#c0c0c0" },
  { text: "" },
  { text: "ABOUT    <DIR>     About Me.lnk",         color: "#00ffff" },
  { text: "PROJECTS <DIR>     Projects.lnk",         color: "#00ffff" },
  { text: "SKILLS   TXT       Skills.txt",            color: "#ffffff" },
  { text: "CONTACT  EXE       Contact.exe",           color: "#00ff00" },
  { text: "RESUME   PDF       Resume.pdf",            color: "#ffffff" },
  { text: "SNAKE    EXE       Snake.exe",             color: "#00ff00" },
  { text: "MINES    EXE       Minesweeper.exe",       color: "#00ff00" },
  { text: "VIRUS    EXE       VirusScan98.exe",       color: "#00ff00" },
  { text: "TERMINAL EXE       Terminal.exe  [YOU ARE HERE]", color: "#ffff00" },
  { text: "" },
  { text: "         9 File(s)        DevOS Edition", color: "#c0c0c0" },
  { text: "" },
];

const WINDOW_COMMANDS: Record<string, WindowId> = {
  about: "about",
  skills: "skills",
  projects: "projects",
  contact: "contact",
  resume: "resume",
  snake: "snake",
  minesweeper: "minesweeper",
  virus: "virus",
};

function makeBootLines(): Line[] {
  return [
    { text: "DevOS 98 Terminal [Version 4.0.0]", color: "#c0c0c0" },
    { text: "Copyright (C) 1998 DevOS Corporation. All rights reserved.", color: "#808080" },
    { text: "" },
    { text: 'Type "help" for a list of available commands.', color: "#808080" },
    { text: "" },
  ];
}

export default function TerminalWindow({ profile }: { profile: Profile | null }) {
  const { openWindow, closeWindow } = useWindowManager();
  const [lines, setLines] = useState<Line[]>(makeBootLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Keep input focused when clicking anywhere in the terminal
  const focusInput = () => inputRef.current?.focus();

  const push = useCallback((...newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const processCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const args = raw.trim().split(/\s+/).slice(1).join(" ");

    // Echo the prompt + command
    push({ text: PROMPT + raw, color: "#00ff00" });

    if (!cmd) return;

    // Window-opening commands
    if (WINDOW_COMMANDS[cmd]) {
      openWindow(WINDOW_COMMANDS[cmd]);
      push({ text: `Opening ${raw.trim()}…`, color: "#808080" }, { text: "" });
      playClick();
      return;
    }

    switch (cmd) {
      case "help":
        push(...HELP_TEXT);
        break;

      case "cls":
      case "clear":
        setLines(makeBootLines());
        break;

      case "exit":
        push({ text: "Closing terminal…", color: "#808080" }, { text: "" });
        setTimeout(() => closeWindow("terminal"), 300);
        break;

      case "ver":
        push(
          { text: "" },
          { text: "DevOS 98 [Version 4.0.0.1381]", color: "#c0c0c0" },
          { text: "Portfolio Edition — Built with Next.js 15", color: "#808080" },
          { text: "" },
        );
        break;

      case "date":
        push(
          { text: "" },
          { text: `The current date is: ${new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" })}`, color: "#c0c0c0" },
          { text: `The current time is: ${new Date().toLocaleTimeString()}`, color: "#c0c0c0" },
          { text: "" },
        );
        break;

      case "whoami":
        push(
          { text: "" },
          { text: `Name    : ${profile?.name ?? "Developer"}`, color: "#00ffff" },
          { text: `Role    : ${profile?.tagline ?? "Full Stack Developer"}`, color: "#00ffff" },
          { text: `Location: ${profile?.location ?? "Earth"}`, color: "#00ffff" },
          { text: `Status  : ${profile?.available ? "✅ Open to opportunities" : "❌ Not available"}`, color: "#00ffff" },
          { text: "" },
        );
        break;

      case "dir":
      case "ls":
        push(...DIR_LISTING);
        break;

      default:
        if (cmd.startsWith("echo")) {
          push({ text: args || "", color: "#ffffff" }, { text: "" });
        } else {
          playError();
          push(
            { text: `'${raw.trim()}' is not recognized as an internal or external command.`, color: "#ff4444" },
            { text: 'Type "help" for available commands.', color: "#808080" },
            { text: "" },
          );
        }
        break;
    }
  }, [openWindow, closeWindow, push, profile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = input;
      if (cmd.trim()) {
        setHistory((h) => [cmd, ...h]);
      }
      setHistIdx(-1);
      setInput("");
      processCommand(cmd);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = Math.min(i + 1, history.length - 1);
        setInput(history[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = Math.max(i - 1, -1);
        setInput(next === -1 ? "" : history[next] ?? "");
        return next;
      });
    }
  };

  return (
    <div
      onClick={focusInput}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#000",
        padding: "8px 10px",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 13,
        color: "#00ff00",
        cursor: "text",
        overflow: "hidden",
      }}
    >
      {/* Output history */}
      <div
        ref={outputRef}
        style={{ flex: 1, overflow: "auto", overflowX: "hidden" }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.color ?? "#00ff00",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              lineHeight: 1.5,
              minHeight: "1.5em",
            }}
          >
            {line.text || " "}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
        <span style={{ color: "#00ff00", userSelect: "none" }}>{PROMPT}</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#00ff00",
            fontFamily: "inherit",
            fontSize: "inherit",
            caretColor: "#00ff00",
            userSelect: "text",
          }}
        />
      </div>
    </div>
  );
}
