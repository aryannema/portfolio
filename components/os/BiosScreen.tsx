"use client";

import { useEffect, useState } from "react";

interface BiosScreenProps {
  onComplete: () => void;
  ownerName: string;
}

const BIOS_LINES = [
  { text: "Award Modular BIOS v4.51PG, An Energy Star Ally", color: "#aaa" },
  { text: "Copyright (C) 1984-98, Award Software, Inc.", color: "#aaa" },
  { text: "", color: "" },
  { text: "DevOS Portfolio Edition — Custom BIOS Build", color: "#ffff00" },
  { text: "", color: "" },
  { text: "Detecting Primary Master... SSD 512GB [PORTFOLIO_OS]", color: "#aaa" },
  { text: "Detecting Primary Slave... None", color: "#aaa" },
  { text: "Detecting Secondary Master... CD-ROM Drive", color: "#aaa" },
  { text: "", color: "" },
  { text: "Checking SDRAM... Extended Memory OK", color: "#aaa" },
  { text: "Initializing USB Controllers... Done", color: "#aaa" },
  { text: "PCI Device Listing:", color: "#aaa" },
  { text: "  Bus 0, Device 2: VGA Controller — Creative GPU 9000", color: "#aaa" },
  { text: "  Bus 0, Device 3: Audio Controller — SoundBlaster Pro", color: "#aaa" },
  { text: "", color: "" },
  { text: "Press DEL to enter SETUP    Press F12 to select Boot Device", color: "#00ffff" },
  { text: "", color: "" },
];

export default function BiosScreen({ onComplete, ownerName }: BiosScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [memCount, setMemCount] = useState(0);
  const [phase, setPhase] = useState<"lines" | "memory" | "progress" | "done">("lines");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let idx = 0;
    const lineTimer = setInterval(() => {
      idx++;
      setVisibleLines(idx);
      if (idx >= BIOS_LINES.length) {
        clearInterval(lineTimer);
        setPhase("memory");
      }
    }, 120);
    return () => clearInterval(lineTimer);
  }, []);

  useEffect(() => {
    if (phase !== "memory") return;
    let mem = 0;
    const target = 524288;
    const memTimer = setInterval(() => {
      mem = Math.min(mem + Math.floor(Math.random() * 8192 + 4096), target);
      setMemCount(mem);
      if (mem >= target) {
        clearInterval(memTimer);
        setTimeout(() => setPhase("progress"), 400);
      }
    }, 40);
    return () => clearInterval(memTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "progress") return;
    let p = 0;
    const progTimer = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(progTimer);
        setPhase("done");
        setTimeout(onComplete, 300);
      }
    }, 35);
    return () => clearInterval(progTimer);
  }, [phase, onComplete]);

  return (
    <div className="bios-screen">
      <div style={{ marginBottom: 16 }}>
        {BIOS_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: line.color || "#aaa", lineHeight: "1.5", minHeight: "1.5em" }}>
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>

      {phase === "memory" || phase === "progress" || phase === "done" ? (
        <div style={{ color: "#aaa", marginBottom: 12 }}>
          Memory: <span style={{ color: "#fff" }}>{memCount.toLocaleString()}</span> KB OK
        </div>
      ) : null}

      {(phase === "progress" || phase === "done") && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: "#aaa", marginBottom: 8 }}>
            Loading <span style={{ color: "#ffff00" }}>DevOS 98</span> — Designed by{" "}
            <span style={{ color: "#00ff00" }}>{ownerName}</span>
          </div>
          <div style={{ width: 360, height: 16, border: "1px solid #555", background: "#000" }}>
            <div
              style={{
                height: "100%",
                background: "#aaaaaa",
                width: `${progress}%`,
                transition: "width 0.05s linear",
              }}
            />
          </div>
          <div style={{ color: "#555", marginTop: 8, fontSize: 13 }}>
            {progress < 100 ? `Loading system files... ${progress}%` : "Starting DevOS 98..."}
          </div>
        </div>
      )}
    </div>
  );
}
