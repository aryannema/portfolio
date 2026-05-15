"use client";

import { Skill } from "@/types";

export default function SkillsWindow({ skills }: { skills: Skill[] }) {
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  if (!skills.length) {
    return (
      <div style={{ flex: 1, background: "#fff", padding: 12, fontSize: 11, fontFamily: "Courier New, monospace" }}>
        <div style={{ color: "#808080" }}>Loading skills...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        background: "#fff",
        padding: 12,
        fontSize: 11,
        fontFamily: "Courier New, monospace",
        lineHeight: 1.6,
      }}
    >
      <div style={{ marginBottom: 12, color: "#000080", fontWeight: "bold" }}>
        ==========================================
        <br />
        &nbsp;&nbsp;SKILLS.TXT — Technical Proficiency Report
        <br />
        ==========================================
      </div>

      {categories.map((cat) => {
        const catSkills = skills
          .filter((s) => s.category === cat)
          .sort((a, b) => a.sort_order - b.sort_order);

        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ color: "#000080", fontWeight: "bold", marginBottom: 6 }}>
              [{cat.toUpperCase()}]
            </div>
            {catSkills.map((skill) => (
              <div key={skill.id} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2,
                    color: "#000",
                  }}
                >
                  <span>{skill.name}</span>
                  <span style={{ color: "#000080" }}>{skill.proficiency}%</span>
                </div>
                <div
                  style={{
                    height: 12,
                    border: "2px inset #808080",
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${skill.proficiency}%`,
                      background: "#000080",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div style={{ marginTop: 12, color: "#808080", borderTop: "1px solid #808080", paddingTop: 8 }}>
        -- End of File --
      </div>
    </div>
  );
}
