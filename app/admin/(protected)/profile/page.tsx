"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Profile } from "@/types";

export default function ProfileAdminPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.from("profile").select("*").single().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, []);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarMsg("");
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setAvatarMsg("");

    const ext = avatarFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (uploadError) {
      setAvatarMsg("Error: " + uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Bust cache with a timestamp so the new image loads immediately
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from("profile")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", profile.id!);

    setAvatarUploading(false);
    if (dbError) {
      setAvatarMsg("Error: " + dbError.message);
    } else {
      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      setAvatarMsg("Avatar updated!");
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    setAvatarMsg("");

    const { error } = await supabase
      .from("profile")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", profile.id!);

    setAvatarUploading(false);
    if (error) {
      setAvatarMsg("Error: " + error.message);
    } else {
      setProfile((p) => ({ ...p, avatar_url: null }));
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      setAvatarMsg("Avatar removed.");
    }
  };

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

      {/* Avatar upload card */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 28, maxWidth: 640, marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 14 }}>Avatar</label>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Preview */}
          <div
            style={{
              width: 80, height: 80, borderRadius: 8, flexShrink: 0,
              border: "1px solid #2a2a2a", background: "#0a0a0a",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", fontSize: 32,
            }}
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar preview" width={80} height={80} style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
            ) : profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Current avatar" width={80} height={80} style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
            ) : (
              "🧑‍💻"
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarSelect}
                style={{ display: "none" }}
                id="avatar-input"
              />
              <label htmlFor="avatar-input" style={{ flex: 1 }}>
                <div style={{ padding: "8px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#a3a3a3", fontSize: 13, cursor: "pointer", textAlign: "center" }}>
                  {avatarFile ? avatarFile.name : "Choose Image"}
                </div>
              </label>
              <button
                onClick={handleAvatarUpload}
                disabled={!avatarFile || avatarUploading}
                style={{
                  padding: "8px 16px",
                  background: !avatarFile || avatarUploading ? "#1a1a1a" : "#e5e5e5",
                  color: !avatarFile || avatarUploading ? "#525252" : "#0a0a0a",
                  border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  cursor: avatarFile && !avatarUploading ? "pointer" : "not-allowed",
                }}
              >
                {avatarUploading ? "Uploading…" : "Upload"}
              </button>
            </div>
            {profile.avatar_url && !avatarFile && (
              <button
                onClick={handleAvatarRemove}
                disabled={avatarUploading}
                style={{ alignSelf: "flex-start", fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Remove avatar
              </button>
            )}
            {avatarMsg && (
              <div style={{ fontSize: 12, color: avatarMsg.startsWith("Error") ? "#f87171" : "#4ade80" }}>{avatarMsg}</div>
            )}
          </div>
        </div>
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
