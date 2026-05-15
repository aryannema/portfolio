"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Skill } from "@/types";

const EMPTY: Omit<Skill, "id"> = { name: "", category: "Frontend", proficiency: 80, sort_order: 0 };
const CATEGORIES = ["Frontend", "Backend", "DevOps", "Mobile", "Database", "Other"];

export default function SkillsAdminPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Partial<Skill> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from("skills").select("*").order("sort_order");
    setSkills(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("skills").update(editing).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("skills").insert(editing));
    }
    setSaving(false);
    setMsg(error ? "Error: " + error.message : "Saved!");
    if (!error) { setEditing(null); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    await supabase.from("skills").delete().eq("id", id);
    load();
  };

  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const inputStyle: React.CSSProperties = {
    padding: "7px 10px", background: "#0a0a0a",
    border: "1px solid #2a2a2a", borderRadius: 5, color: "#e5e5e5", fontSize: 12, outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#e5e5e5" }}>Skills</h1>
        <button
          onClick={() => { setEditing({ ...EMPTY }); setMsg(""); }}
          style={{ padding: "7px 16px", background: "#e5e5e5", color: "#0a0a0a", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + Add Skill
        </button>
      </div>

      {editing && (
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "#737373", marginBottom: 5 }}>Skill Name</div>
              <input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={{ ...inputStyle, width: 160 }} placeholder="e.g. React" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#737373", marginBottom: 5 }}>Category</div>
              <select value={editing.category ?? "Frontend"} onChange={(e) => setEditing({ ...editing, category: e.target.value })} style={{ ...inputStyle, width: 130 }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#737373", marginBottom: 5 }}>Proficiency ({editing.proficiency ?? 80}%)</div>
              <input type="range" min={0} max={100} step={5} value={editing.proficiency ?? 80} onChange={(e) => setEditing({ ...editing, proficiency: +e.target.value })} style={{ width: 120 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#737373", marginBottom: 5 }}>Sort Order</div>
              <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })} style={{ ...inputStyle, width: 70 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} style={{ padding: "7px 16px", background: "#e5e5e5", color: "#0a0a0a", border: "none", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {saving ? "..." : "Save"}
              </button>
              <button onClick={() => setEditing(null)} style={{ padding: "7px 12px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 5, color: "#737373", fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
          {msg && <div style={{ marginTop: 10, fontSize: 12, color: msg.startsWith("Error") ? "#f87171" : "#4ade80" }}>{msg}</div>}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f1f1f", fontSize: 12, fontWeight: 600, color: "#737373", letterSpacing: 1 }}>
            {cat.toUpperCase()}
          </div>
          {skills.filter((s) => s.category === cat).map((skill) => (
            <div key={skill.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #0d0d0d", gap: 16 }}>
              <span style={{ fontSize: 13, color: "#e5e5e5", minWidth: 120 }}>{skill.name}</span>
              <div style={{ flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#e5e5e5", width: `${skill.proficiency}%`, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 12, color: "#737373", minWidth: 36, textAlign: "right" }}>{skill.proficiency}%</span>
              <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                <button onClick={() => { setEditing({ ...skill }); setMsg(""); }} style={{ padding: "3px 10px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 4, color: "#a3a3a3", fontSize: 11, cursor: "pointer" }}>Edit</button>
                <button onClick={() => del(skill.id)} style={{ padding: "3px 10px", background: "transparent", border: "1px solid #3a1a1a", borderRadius: 4, color: "#f87171", fontSize: 11, cursor: "pointer" }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {skills.length === 0 && !editing && (
        <div style={{ color: "#525252", fontSize: 13, textAlign: "center", padding: 40 }}>No skills yet. Add your first!</div>
      )}
    </div>
  );
}
