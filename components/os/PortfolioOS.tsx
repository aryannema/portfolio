"use client";

import { useState } from "react";
import { playStartup } from "@/lib/sounds";
import BiosScreen from "./BiosScreen";
import BootScreen from "./BootScreen";
import Desktop from "./Desktop";
import { WindowManagerProvider } from "./WindowManager";
import { Profile, Skill, Project } from "@/types";

type Phase = "bios" | "boot" | "desktop";

interface PortfolioOSProps {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  resumeUrl: string | null;
}

export default function PortfolioOS({ profile, skills, projects, resumeUrl }: PortfolioOSProps) {
  const [phase, setPhase] = useState<Phase>("bios");

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* CRT overlay effects */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {phase === "bios" && (
        <BiosScreen
          ownerName={profile?.name ?? "Developer"}
          onComplete={() => setPhase("boot")}
        />
      )}

      {phase === "boot" && (
        <BootScreen onComplete={() => { setPhase("desktop"); playStartup(); }} />
      )}

      {phase === "desktop" && (
        <WindowManagerProvider>
          <Desktop
            profile={profile}
            skills={skills}
            projects={projects}
            resumeUrl={resumeUrl}
          />
        </WindowManagerProvider>
      )}
    </div>
  );
}
