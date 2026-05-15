"use client";

import { useState } from "react";

export default function ResumeWindow({ resumeUrl }: { resumeUrl: string | null }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (!resumeUrl) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.href = resumeUrl;
    a.download = "resume.pdf";
    a.target = "_blank";
    a.click();
    setTimeout(() => setDownloading(false), 2000);
  };

  if (!resumeUrl) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#c0c0c0",
          gap: 12,
          fontFamily: "MS Sans Serif, Arial, sans-serif",
          fontSize: 11,
        }}
      >
        <span style={{ fontSize: 48 }}>📋</span>
        <div style={{ border: "2px inset #808080", background: "#fff", padding: "10px 20px", textAlign: "center" }}>
          <div style={{ color: "#808080", marginBottom: 6 }}>No resume uploaded yet.</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>Upload one via the admin dashboard.</div>
        </div>
        <button className="win95-btn" disabled style={{ color: "#808080" }}>
          No Resume Available
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px",
          background: "#c0c0c0",
          borderBottom: "2px solid",
          borderColor: "#808080 #fff #fff #808080",
          flexShrink: 0,
          fontFamily: "MS Sans Serif, Arial, sans-serif",
          fontSize: 11,
        }}
      >
        <span style={{ fontSize: 16 }}>📋</span>
        <span style={{ flex: 1, fontWeight: "bold" }}>resume.pdf</span>
        <button
          className="win95-btn"
          onClick={handleDownload}
          disabled={downloading}
          style={{ fontSize: 11, minWidth: 0, padding: "2px 10px" }}
        >
          {downloading ? "⏳ Opening…" : "📥 Download"}
        </button>
        <a href={resumeUrl} target="_blank" rel="noreferrer">
          <button className="win95-btn" style={{ fontSize: 11, minWidth: 0, padding: "2px 10px" }}>
            ↗ Open Tab
          </button>
        </a>
      </div>

      {/* PDF iframe */}
      <iframe
        src={resumeUrl}
        title="Resume"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          background: "#fff",
          display: "block",
        }}
      />
    </div>
  );
}
