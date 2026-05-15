"use client";

import { Profile } from "@/types";

export default function AboutWindow({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <div style={{ padding: 16, background: "#fff", flex: 1, fontFamily: "MS Sans Serif, Arial, sans-serif", fontSize: 11 }}>
        <div style={{ color: "#808080" }}>Loading profile data...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top banner */}
      <div
        style={{
          background: "#000080",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            background: "#c0c0c0",
            border: "2px solid",
            borderColor: "#fff #808080 #808080 #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          🧑‍💻
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{profile.name}</div>
          <div style={{ color: "#aaa", fontSize: 11 }}>{profile.tagline}</div>
        </div>
      </div>

      {/* Tabs-like content */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff", padding: 12, fontSize: 11, fontFamily: "MS Sans Serif, Arial, sans-serif" }}>
        {/* General */}
        <div style={{ border: "2px inset #808080", padding: 12, marginBottom: 10 }}>
          <div style={{ fontWeight: "bold", borderBottom: "1px solid #808080", paddingBottom: 4, marginBottom: 8 }}>
            General
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Name", profile.name],
                ["Role", profile.tagline],
                ["Location", profile.location],
                ["Email", profile.email],
                ["Available", profile.available ? "✅ Open to opportunities" : "❌ Not available"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#000080", fontWeight: "bold", padding: "4px 0", width: 90, verticalAlign: "top" }}>
                    {k}:
                  </td>
                  <td style={{ padding: "4px 0", color: "#000" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bio */}
        <div style={{ border: "2px inset #808080", padding: 12, marginBottom: 10 }}>
          <div style={{ fontWeight: "bold", borderBottom: "1px solid #808080", paddingBottom: 4, marginBottom: 8 }}>
            Bio
          </div>
          <p style={{ lineHeight: 1.8, color: "#000" }}>{profile.bio}</p>
        </div>

        {/* Links */}
        <div style={{ border: "2px inset #808080", padding: 12 }}>
          <div style={{ fontWeight: "bold", borderBottom: "1px solid #808080", paddingBottom: 4, marginBottom: 8 }}>
            Links
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#000080", textDecoration: "underline", cursor: "pointer" }}
              >
                🐙 {profile.github_url}
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#000080", textDecoration: "underline", cursor: "pointer" }}
              >
                💼 {profile.linkedin_url}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
