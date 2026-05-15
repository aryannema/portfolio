"use client";

import { useEffect, useState } from "react";

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_MESSAGES = [
  "Loading kernel modules...",
  "Starting system services...",
  "Mounting file system...",
  "Initializing display driver...",
  "Loading shell environment...",
  "Starting DevOS 98...",
];

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += 1.5;
      setProgress(Math.min(p, 100));
      const newMsgIdx = Math.floor((p / 100) * BOOT_MESSAGES.length);
      setMsgIdx(Math.min(newMsgIdx, BOOT_MESSAGES.length - 1));
      if (p >= 100) {
        clearInterval(t);
        setTimeout(onComplete, 500);
      }
    }, 40);
    return () => clearInterval(t);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 900,
      }}
    >
      <div
        style={{
          fontFamily: "VT323, monospace",
          fontSize: 52,
          color: "#fff",
          letterSpacing: 4,
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#0078d4" }}>Dev</span>OS
        <span style={{ fontSize: 28, color: "#888", marginLeft: 8 }}>98</span>
      </div>

      <div
        style={{
          fontFamily: "VT323, monospace",
          fontSize: 16,
          color: "#555",
          marginBottom: 24,
          letterSpacing: 2,
        }}
      >
        Professional Portfolio Edition
      </div>

      <div
        style={{
          width: 220,
          height: 8,
          border: "1px solid #333",
          background: "#000",
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#0078d4",
            transition: "width 0.04s linear",
          }}
        />
      </div>

      <div
        style={{
          fontFamily: "VT323, monospace",
          fontSize: 14,
          color: "#444",
          letterSpacing: 1,
        }}
      >
        {BOOT_MESSAGES[msgIdx]}
      </div>
    </div>
  );
}
