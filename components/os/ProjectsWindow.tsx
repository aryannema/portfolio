"use client";

import { useState } from "react";
import { Project } from "@/types";
import { useIsMobile } from "@/lib/useIsMobile";

export default function ProjectsWindow({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleProjectClick = async (id: string) => {
    setSelected(id);
    try {
      await fetch(`/api/projects/${id}/view`, { method: "POST" });
    } catch {}
  };

  const selectedProject = projects.find((p) => p.id === selected);

  if (!projects.length) {
    return (
      <div style={{ flex: 1, background: "#c0c0c0", padding: 16, fontSize: 11 }}>
        <div style={{ color: "#808080" }}>No projects found...</div>
      </div>
    );
  }

  const projectDetail = (p: Project) => (
    <div>
      <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>📦</span>
        {p.title}
      </div>
      <div style={{ border: "2px inset #808080", background: "#fff", padding: 10, marginBottom: 8 }}>
        <div style={{ color: "#808080", marginBottom: 4 }}>Description:</div>
        <div style={{ lineHeight: 1.7 }}>{p.description}</div>
      </div>
      <div style={{ border: "2px inset #808080", background: "#fff", padding: 10, marginBottom: 8 }}>
        <div style={{ color: "#808080", marginBottom: 6 }}>Tech Stack:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {p.tech_stack.map((t) => (
            <span key={t} style={{ border: "1px solid #808080", background: "#c0c0c0", padding: "1px 6px", fontSize: 10 }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ border: "2px inset #808080", background: "#fff", padding: 10, marginBottom: 8 }}>
        <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={{ color: "#808080", paddingBottom: 4 }}>Views:</td><td style={{ fontWeight: "bold" }}>{p.view_count.toLocaleString()}</td></tr>
            <tr><td style={{ color: "#808080", paddingBottom: 4 }}>Created:</td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer"><button className="win95-btn" style={{ fontSize: 11 }}>🐙 GitHub</button></a>}
        {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer"><button className="win95-btn" style={{ fontSize: 11 }}>🌐 Live Demo</button></a>}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ flex: 1, overflow: "auto", background: "#c0c0c0", padding: 12, fontSize: 11, fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        {selectedProject ? (
          <>
            <button
              className="win95-btn"
              onClick={() => setSelected(null)}
              style={{ marginBottom: 12, fontSize: 11 }}
            >
              ← Back
            </button>
            {projectDetail(selectedProject)}
          </>
        ) : (
          <div style={{ border: "2px inset #808080", background: "#fff", padding: 4 }}>
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => handleProjectClick(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 6px", cursor: "pointer",
                  background: selected === p.id ? "#000080" : "transparent",
                  color: selected === p.id ? "#fff" : "#000",
                  fontSize: 13, borderBottom: "1px solid #e0e0e0",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>📦</span>
                <span style={{ flex: 1 }}>{p.title}</span>
                {p.featured && <span style={{ fontSize: 10, background: "#ffff00", color: "#000", padding: "0 3px", flexShrink: 0 }}>★</span>}
                <span style={{ color: "#808080", fontSize: 12 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Left: file list */}
      <div style={{ width: "45%", borderRight: "2px inset #808080", overflow: "auto", background: "#fff", padding: 4 }}>
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => handleProjectClick(p.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 6px", cursor: "pointer",
              background: selected === p.id ? "#000080" : "transparent",
              color: selected === p.id ? "#fff" : "#000",
              fontSize: 11, fontFamily: "MS Sans Serif, Arial, sans-serif",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>📦</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
            {p.featured && <span style={{ fontSize: 9, background: "#ffff00", color: "#000", padding: "0 3px", marginLeft: "auto", flexShrink: 0 }}>★</span>}
          </div>
        ))}
      </div>

      {/* Right: project detail */}
      <div style={{ flex: 1, overflow: "auto", background: "#c0c0c0", padding: 12, fontSize: 11, fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        {selectedProject ? projectDetail(selectedProject) : (
          <div style={{ color: "#808080", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div>Select a project to view details</div>
          </div>
        )}
      </div>
    </div>
  );
}
