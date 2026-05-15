"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Profile } from "@/types";

export default function ProfileAdminPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.from("profile").select("*").single().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("profile")
      .upsert({ ...profile, updated_at: new Date().toISOString() });
    setSaving(false);
    setMsg(error ? "Error: " + error.message : "Profile saved!");
  };

  const fields: { key: keyof Profile; label: string; type?: string; textarea?: boolean }[] = [
    { key: "name", label: "Full Name" },
    { key: "tagline", label: "Tagline / Role" },
    { key: "bio", label: "Bio", textarea: true },
    { key: "email", label: "Contact Email", type: "email" },
    { key: "location", label: "Location" },
    { key: "github_url", label: "GitHub URL", type: "url" },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: "#0a0a0a",
    border: "1px solid #2a2a2a", borderRadius: 6, color: "#e5e5e5",
    fontSize: 13, outline: "none",
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>Profile</h1>
        <p style={{ color: "#525252", fontSize: 13 }}>Edit the info shown in your About window.</p>
      </div>

      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 28, maxWidth: 640 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {fields.map(({ key, label, type, textarea }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>{label}</label>
              {textarea ? (
                <textarea
                  value={(profile[key] as string) ?? ""}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              ) : (
                <input
                  type={type ?? "text"}
                  value={(profile[key] as string) ?? ""}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              id="available"
              checked={profile.available ?? false}
              onChange={(e) => setProfile({ ...profile, available: e.target.checked })}
            />
            <label htmlFor="available" style={{ fontSize: 13, color: "#a3a3a3" }}>
              Available for opportunities
            </label>
          </div>

          {msg && (
            <div style={{ fontSize: 13, color: msg.startsWith("Error") ? "#f87171" : "#4ade80" }}>{msg}</div>
          )}

          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "10px 24px", background: saving ? "#1a1a1a" : "#e5e5e5",
              color: saving ? "#525252" : "#0a0a0a", border: "none",
              borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
