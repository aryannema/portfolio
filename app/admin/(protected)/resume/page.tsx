"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ResumeAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMsg("");

    const { error } = await supabase.storage
      .from("resume")
      .upload("resume.pdf", file, { upsert: true, contentType: "application/pdf" });

    setUploading(false);
    setMsg(error ? "Error: " + error.message : "Resume uploaded successfully! It will now appear in the portfolio.");
    setFile(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>Resume</h1>
        <p style={{ color: "#525252", fontSize: 13 }}>Upload your resume PDF. It replaces any existing one.</p>
      </div>

      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 28, maxWidth: 480 }}>
        <div
          style={{
            border: "2px dashed #2a2a2a", borderRadius: 8, padding: 40,
            textAlign: "center", marginBottom: 20,
            background: file ? "#0d1a0d" : "transparent",
            borderColor: file ? "#1a3a1a" : "#2a2a2a",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          {file ? (
            <div>
              <div style={{ color: "#4ade80", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{file.name}</div>
              <div style={{ color: "#525252", fontSize: 12 }}>{(file.size / 1024).toFixed(0)} KB</div>
            </div>
          ) : (
            <div>
              <div style={{ color: "#737373", fontSize: 14, marginBottom: 8 }}>Drop your PDF here or click to browse</div>
              <div style={{ color: "#404040", fontSize: 12 }}>PDF files only</div>
            </div>
          )}
        </div>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: "none" }}
          id="resume-input"
        />

        <div style={{ display: "flex", gap: 10 }}>
          <label htmlFor="resume-input" style={{ flex: 1 }}>
            <div
              style={{
                padding: "9px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 6, color: "#a3a3a3", fontSize: 13, cursor: "pointer", textAlign: "center",
              }}
            >
              Choose File
            </div>
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              flex: 1, padding: "9px 16px",
              background: !file || uploading ? "#1a1a1a" : "#e5e5e5",
              color: !file || uploading ? "#525252" : "#0a0a0a",
              border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: file && !uploading ? "pointer" : "not-allowed",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {msg && (
          <div
            style={{
              marginTop: 16, padding: "10px 14px", borderRadius: 6, fontSize: 13,
              background: msg.startsWith("Error") ? "#1a0a0a" : "#0d1a0d",
              border: `1px solid ${msg.startsWith("Error") ? "#3a1a1a" : "#1a3a1a"}`,
              color: msg.startsWith("Error") ? "#f87171" : "#4ade80",
            }}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
