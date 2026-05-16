"use client";

import { useState, useEffect } from "react";
import { useWindowManager, WindowId } from "./WindowManager";
import { getMuted, setMuted } from "@/lib/sounds";
import { useIsMobile } from "@/lib/useIsMobile";

interface TaskbarProps {
  onOpenWindow: (id: WindowId) => void;
}

const START_MENU_ITEMS: { label: string; icon: string; id?: WindowId; action?: string }[] = [
  { label: "About Me", icon: "🧑‍💻", id: "about" },
  { label: "Projects", icon: "📁", id: "projects" },
  { label: "Skills.txt", icon: "📄", id: "skills" },
  { label: "Contact.exe", icon: "✉️", id: "contact" },
  { label: "Resume.pdf", icon: "📋", id: "resume" },
  { label: "---", icon: "" },
  { label: "Terminal", icon: "💻", id: "terminal" },
  { label: "Snake.exe", icon: "🐍", id: "snake" },
  { label: "Minesweeper", icon: "💣", id: "minesweeper" },
  { label: "VirusScan 98", icon: "🛡️", id: "virus" },
];

export default function Taskbar({ onOpenWindow }: TaskbarProps) {
  const { windows, restoreWindow, minimizeWindow } = useWindowManager();
  const [startOpen, setStartOpen] = useState(false);
  const [clock, setClock] = useState("");
  const [muted, setMutedState] = useState(false);
  const isMobile = useIsMobile();

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const h = String(n.getHours()).padStart(2, "0");
      const m = String(n.getMinutes()).padStart(2, "0");
      setClock(`${h}:${m}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  const handleTaskbarBtn = (id: WindowId) => {
    const win = windows[id];
    if (win.isMinimized) {
      restoreWindow(id);
    } else {
      minimizeWindow(id);
    }
  };

  return (
    <div className="taskbar" onClick={() => setStartOpen(false)}>
      {/* Start button */}
      <button
        className={`start-button ${startOpen ? "active" : ""}`}
        onClick={(e) => { e.stopPropagation(); setStartOpen((v) => !v); }}
      >
        <span style={{ fontSize: 16 }}>⊞</span>
        <span>Start</span>
      </button>

      {/* Separator */}
      <div style={{ width: 2, height: 22, background: "#808080", borderRight: "1px solid #fff", margin: "0 2px" }} />

      {/* Open window buttons — hidden on mobile (full-screen windows have their own close) */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 2, flex: 1, overflow: "hidden" }}>
          {openWindows.map((w) => (
            <button
              key={w.id}
              className={`taskbar-window-btn ${!w.isMinimized ? "active" : ""}`}
              onClick={() => handleTaskbarBtn(w.id)}
            >
              {w.icon} {w.title}
            </button>
          ))}
        </div>
      )}
      {isMobile && <div style={{ flex: 1 }} />}

      {/* System tray */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: "2px inset #808080",
          padding: "2px 6px",
          background: "#c0c0c0",
          flexShrink: 0,
          marginLeft: 4,
        }}
      >
        <button
          onClick={toggleMute}
          title={muted ? "Unmute sounds" : "Mute sounds"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            padding: "0 3px",
            lineHeight: 1,
            opacity: muted ? 0.45 : 1,
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <div style={{ width: 1, height: 14, background: "#808080", margin: "0 3px" }} />
        <span style={{ fontSize: 11 }}>{clock}</span>
      </div>

      {/* Start Menu */}
      {startOpen && (
        <div className="start-menu" onClick={(e) => e.stopPropagation()}>
          <div className="start-menu-sidebar">
            <span>DevOS 98</span>
          </div>
          <div className="start-menu-items">
            {START_MENU_ITEMS.map((item, i) =>
              item.label === "---" ? (
                <div key={i} className="start-menu-separator" />
              ) : (
                <div
                  key={i}
                  className="start-menu-item"
                  onClick={() => {
                    if (item.id) {
                      onOpenWindow(item.id);
                      setStartOpen(false);
                    }
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )
            )}
            <div className="start-menu-separator" />
            <div
              className="start-menu-item"
              style={{ color: "#800000" }}
              onClick={() => window.location.reload()}
            >
              <span style={{ fontSize: 16 }}>🔌</span>
              <span>Shut Down...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
