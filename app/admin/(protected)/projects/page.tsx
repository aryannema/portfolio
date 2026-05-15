"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Project } from "@/types";

const EMPTY: Omit<Project, "id" | "view_count" | "created_at"> = {
  title: "", description: "", tech_stack: [], github_url: "", live_url: "", featured: false,
};

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...EMPTY }); setTechInput(""); setMsg(""); };
  const openEdit = (p: Project) => { setEditing({ ...p }); setTechInput(p.tech_stack.join(", ")); setMsg(""); };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      ...editing,
      tech_stack: techInput.split(",").map((t) => t.trim()).filter(Boolean),
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("projects").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("projects").insert({ ...payload, view_count: 0 }));
    }
    setSaving(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setMsg("Saved!");
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#e5e5e5" }}>Projects</h1>
        <button
          onClick={openNew}
          style={{ padding: "8px 18px", background: "#e5e5e5", color: "#0a0a0a", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + New Project
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e5e5e5", marginBottom: 20 }}>
            {editing.id ? "Edit Project" : "New Project"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {(["title", "github_url", "live_url"] as const).map((field) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6, textTransform: "capitalize" }}>
                  {field.replace("_", " ")}
                </label>
                <input
                  value={(editing[field] as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#e5e5e5", fontSize: 13, outline: "none" }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>Tech Stack (comma-separated)</label>
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="React, Node.js, Supabase"
                style={{ width: "100%", padding: "8px 12px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#e5e5e5", fontSize: 13, outline: "none" }}
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>Description</label>
            <textarea
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
              style={{ width: "100%", padding: "8px 12px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#e5e5e5", fontSize: 13, outline: "none", resize: "vertical" }}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              id="featured"
              checked={editing.featured ?? false}
              onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
            />
            <label htmlFor="featured" style={{ fontSize: 13, color: "#a3a3a3" }}>Featured project</label>
          </div>
          {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg.startsWith("Error") ? "#f87171" : "#4ade80" }}>{msg}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving} style={{ padding: "8px 20px", background: "#e5e5e5", color: "#0a0a0a", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(null)} style={{ padding: "8px 20px", background: "transparent", color: "#737373", border: "1px solid #2a2a2a", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#a3a3a3" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1f1f1f", background: "#0d0d0d" }}>
              {["Title", "Tech Stack", "Featured", "Views", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#525252", fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #141414" }}>
                <td style={{ padding: "12px 16px", color: "#e5e5e5", fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {p.tech_stack.map((t) => (
                      <span key={t} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, padding: "1px 7px", fontSize: 11 }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>{p.featured ? "⭐" : "—"}</td>
                <td style={{ padding: "12px 16px" }}>{p.view_count}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(p)} style={{ padding: "4px 12px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 4, color: "#a3a3a3", fontSize: 12, cursor: "pointer" }}>Edit</button>
                    <button onClick={() => del(p.id)} style={{ padding: "4px 12px", background: "transparent", border: "1px solid #3a1a1a", borderRadius: 4, color: "#f87171", fontSize: 12, cursor: "pointer" }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: "#525252" }}>No projects yet. Add one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
