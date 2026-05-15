"use client";

import { useEffect, useState } from "react";

const SCAN_FILES = [
  "C:\\WINDOWS\\system32\\creativity.dll",
  "C:\\Users\\Visitor\\first_impressions.dat",
  "C:\\DevOS\\portfolio\\index.tsx",
  "C:\\Program Files\\React\\hooks.js",
  "C:\\DevOS\\apps\\coffee_manager.exe",
  "C:\\WINDOWS\\system32\\vim_muscle_memory.sys",
  "C:\\Users\\Dev\\documents\\stack_overflow_bookmarks.html",
  "C:\\DevOS\\games\\snake.exe",
  "C:\\Program Files\\Git\\too_many_commits.log",
  "C:\\DevOS\\secrets\\too_much_coffee.exe",
];

const THREATS = [
  { file: "too_much_coffee.exe", verdict: "Quarantined (required for productivity)" },
  { file: "too_many_commits.log", verdict: "Ignored (normal developer behavior)" },
];

export default function VirusWindow() {
  const [phase, setPhase] = useState<"scanning" | "done">("scanning");
  const [scannedIdx, setScannedIdx] = useState(0);
  const [currentFile, setCurrentFile] = useState(SCAN_FILES[0]);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setScannedIdx(i);
      setCurrentFile(SCAN_FILES[Math.min(i, SCAN_FILES.length - 1)]);
      if (i >= SCAN_FILES.length) {
        clearInterval(t);
        setTimeout(() => setPhase("done"), 400);
      }
    }, 500);
    return () => clearInterval(t);
  }, []);

  const progress = Math.round((scannedIdx / SCAN_FILES.length) * 100);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        background: "#c0c0c0",
        padding: 16,
        fontSize: 11,
        fontFamily: "MS Sans Serif, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>🛡️</span>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 13 }}>DevAntivirus 98</div>
          <div style={{ color: "#555" }}>Professional Edition v2.0</div>
        </div>
      </div>

      <div style={{ border: "2px inset #808080", background: "#fff", padding: 12, marginBottom: 10 }}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          {phase === "scanning" ? "Scanning your system..." : "Scan Complete!"}
        </div>

        <div style={{ marginBottom: 6 }}>
          <div style={{ color: "#555", marginBottom: 3, fontSize: 10 }}>
            Scanning: <span style={{ color: "#000080" }}>{currentFile}</span>
          </div>
          <div
            style={{
              height: 14,
              border: "2px inset #808080",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: phase === "done" ? "#008000" : "#000080",
                width: `${progress}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div style={{ color: "#555", marginTop: 3, fontSize: 10 }}>
            {scannedIdx} / {SCAN_FILES.length} files — {progress}%
          </div>
        </div>
      </div>

      {phase === "done" && (
        <div>
          <div
            style={{
              border: "2px inset #808080",
              background: "#fff",
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: "bold", color: "#008000", marginBottom: 8 }}>
              ✅ Scan Results
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <tbody>
                <tr>
                  <td style={{ color: "#555", paddingBottom: 4 }}>Files Scanned:</td>
                  <td style={{ fontWeight: "bold" }}>42,069</td>
                </tr>
                <tr>
                  <td style={{ color: "#555", paddingBottom: 4 }}>Threats Found:</td>
                  <td style={{ fontWeight: "bold", color: "#800000" }}>2</td>
                </tr>
                <tr>
                  <td style={{ color: "#555" }}>Scan Duration:</td>
                  <td>00:00:05</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              border: "2px inset #808080",
              background: "#fff",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: "bold", color: "#800000", marginBottom: 8 }}>
              ⚠️ Suspicious Files
            </div>
            {THREATS.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fffde7",
                  border: "1px solid #808080",
                  padding: "6px 8px",
                  marginBottom: 6,
                  fontSize: 10,
                }}
              >
                <div style={{ fontFamily: "Courier New, monospace", color: "#800000" }}>
                  {t.file}
                </div>
                <div style={{ color: "#555", marginTop: 2 }}>Action: {t.verdict}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "scanning" && (
        <div style={{ color: "#555", fontSize: 10, marginTop: 8 }}>
          Please wait while DevAntivirus scans your system...
        </div>
      )}
    </div>
  );
}
