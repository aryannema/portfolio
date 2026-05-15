"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface ExtractedSkill {
  name: string;
  category: string;
  proficiency: number;
  selected: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "#3b82f6",
  Backend: "#10b981",
  Database: "#f59e0b",
  DevOps: "#8b5cf6",
  Mobile: "#ec4899",
  Other: "#6b7280",
};

export default function ResumeAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [hasResume, setHasResume] = useState(false);

  const [extracting, setExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[] | null>(null);
  const [extractError, setExtractError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const supabase = createClient();

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    setExtractedSkills(null);
    setImportMsg("");

    const { error } = await supabase.storage
      .from("resume")
      .upload("resume.pdf", file, { upsert: true, contentType: "application/pdf" });

    setUploading(false);
    if (error) {
      setUploadMsg("Error: " + error.message);
    } else {
      setUploadMsg("Resume uploaded successfully!");
      setHasResume(true);
      setFile(null);
    }
  };

  // ── Extract skills ─────────────────────────────────────────────────────────

  const handleExtract = async () => {
    setExtracting(true);
    setExtractError("");
    setExtractedSkills(null);
    setImportMsg("");

    const res = await fetch("/api/admin/extract-skills", { method: "POST" });
    const data = await res.json();

    setExtracting(false);
    if (!res.ok) {
      setExtractError(data.error ?? "Failed to extract skills");
      return;
    }

    const skills: ExtractedSkill[] = (data.skills as { name: string; category: string; proficiency: number }[]).map(
      (s) => ({ ...s, selected: true })
    );
    setExtractedSkills(skills.length ? skills : null);
    if (!skills.length) setExtractError("No recognisable skills found in the resume.");
  };

  // ── Toggle / slider helpers ────────────────────────────────────────────────

  const toggleSkill = (idx: number) =>
    setExtractedSkills((prev) =>
      prev ? prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s)) : prev
    );

  const setProf = (idx: number, value: number) =>
    setExtractedSkills((prev) =>
      prev ? prev.map((s, i) => (i === idx ? { ...s, proficiency: value } : s)) : prev
    );

  // ── Import selected skills ────────────────────────────────────────────────

  const handleImport = async () => {
    if (!extractedSkills) return;
    const toImport = extractedSkills.filter((s) => s.selected);
    if (!toImport.length) return;

    setImporting(true);
    setImportMsg("");

    const rows = toImport.map((s, i) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      sort_order: i,
    }));

    const { error } = await supabase.from("skills").insert(rows);
    setImporting(false);

    if (error) {
      setImportMsg("Error: " + error.message);
    } else {
      setImportMsg(`${toImport.length} skill${toImport.length !== 1 ? "s" : ""} imported! Set proficiency levels in the Skills tab.`);
      setExtractedSkills(null);
    }
  };

  const selectedCount = extractedSkills?.filter((s) => s.selected).length ?? 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>Resume</h1>
        <p style={{ color: "#525252", fontSize: 13 }}>Upload your resume PDF. It replaces any existing one.</p>
      </div>

      {/* Upload card */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 28, maxWidth: 540, marginBottom: 28 }}>
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
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUploadMsg(""); }}
          style={{ display: "none" }}
          id="resume-input"
        />

        <div style={{ display: "flex", gap: 10 }}>
          <label htmlFor="resume-input" style={{ flex: 1 }}>
            <div style={{ padding: "9px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#a3a3a3", fontSize: 13, cursor: "pointer", textAlign: "center" }}>
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
              border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: file && !uploading ? "pointer" : "not-allowed",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {uploadMsg && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 6, fontSize: 13,
            background: uploadMsg.startsWith("Error") ? "#1a0a0a" : "#0d1a0d",
            border: `1px solid ${uploadMsg.startsWith("Error") ? "#3a1a1a" : "#1a3a1a"}`,
            color: uploadMsg.startsWith("Error") ? "#f87171" : "#4ade80",
          }}>
            {uploadMsg}
          </div>
        )}

        {/* Extract Skills button — shown after a successful upload or as a standalone action */}
        {(hasResume || uploadMsg === "Resume uploaded successfully!") && !extractedSkills && (
          <button
            onClick={handleExtract}
            disabled={extracting}
            style={{
              marginTop: 16, width: "100%", padding: "9px 16px",
              background: extracting ? "#1a1a1a" : "#0f1f3a",
              color: extracting ? "#525252" : "#60a5fa",
              border: "1px solid #1e3a5f", borderRadius: 6,
              fontSize: 13, fontWeight: 500, cursor: extracting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {extracting ? (
              <>⏳ Scanning resume for skills…</>
            ) : (
              <>🔍 Extract Skills from Resume</>
            )}
          </button>
        )}

        {extractError && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 6, fontSize: 13, background: "#1a0a0a", border: "1px solid #3a1a1a", color: "#f87171" }}>
            {extractError}
          </div>
        )}
      </div>

      {/* ── Extracted skills panel ─────────────────────────────────────────── */}
      {extractedSkills && extractedSkills.length > 0 && (
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 28, maxWidth: 540 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>
              🎯 Detected Skills ({extractedSkills.length})
            </div>
            <div style={{ fontSize: 12, color: "#525252" }}>
              Check the skills to import and adjust proficiency. You can fine-tune them in the Skills tab afterward.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {extractedSkills.map((skill, idx) => (
              <div
                key={skill.name}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 8,
                  background: skill.selected ? "#0d1829" : "#0a0a0a",
                  border: `1px solid ${skill.selected ? "#1e3a5f" : "#1f1f1f"}`,
                  opacity: skill.selected ? 1 : 0.45,
                  transition: "all 0.15s",
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={skill.selected}
                  onChange={() => toggleSkill(idx)}
                  style={{ accentColor: "#3b82f6", width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
                />

                {/* Name + category */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e5e5e5", marginBottom: 2 }}>
                    {skill.name}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
                    color: CATEGORY_COLORS[skill.category] ?? "#6b7280",
                    textTransform: "uppercase",
                  }}>
                    {skill.category}
                  </span>
                </div>

                {/* Proficiency slider */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={skill.proficiency}
                    disabled={!skill.selected}
                    onChange={(e) => setProf(idx, Number(e.target.value))}
                    style={{ width: 80, accentColor: "#3b82f6" }}
                  />
                  <span style={{ fontSize: 12, color: "#737373", width: 32, textAlign: "right" }}>
                    {skill.proficiency}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Select all / none */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setExtractedSkills((p) => p?.map((s) => ({ ...s, selected: true })) ?? p)}
              style={{ fontSize: 12, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Select all
            </button>
            <span style={{ color: "#404040" }}>·</span>
            <button
              onClick={() => setExtractedSkills((p) => p?.map((s) => ({ ...s, selected: false })) ?? p)}
              style={{ fontSize: 12, color: "#737373", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Deselect all
            </button>
          </div>

          <button
            onClick={handleImport}
            disabled={importing || selectedCount === 0}
            style={{
              width: "100%", padding: "10px 16px",
              background: selectedCount === 0 || importing ? "#1a1a1a" : "#e5e5e5",
              color: selectedCount === 0 || importing ? "#525252" : "#0a0a0a",
              border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600,
              cursor: selectedCount > 0 && !importing ? "pointer" : "not-allowed",
            }}
          >
            {importing ? "Importing…" : `Import ${selectedCount} Skill${selectedCount !== 1 ? "s" : ""}`}
          </button>

          {importMsg && (
            <div style={{
              marginTop: 14, padding: "10px 14px", borderRadius: 6, fontSize: 13,
              background: importMsg.startsWith("Error") ? "#1a0a0a" : "#0d1a0d",
              border: `1px solid ${importMsg.startsWith("Error") ? "#3a1a1a" : "#1a3a1a"}`,
              color: importMsg.startsWith("Error") ? "#f87171" : "#4ade80",
            }}>
              {importMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
