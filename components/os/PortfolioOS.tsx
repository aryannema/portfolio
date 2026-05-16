"use client";

import { useState, useEffect } from "react";
import { playStartup } from "@/lib/sounds";
import BiosScreen from "./BiosScreen";
import BootScreen from "./BootScreen";
import LoginScreen from "./LoginScreen";
import Desktop from "./Desktop";
import { WindowManagerProvider } from "./WindowManager";
import { Profile, Skill, Project } from "@/types";

type Phase = "bios" | "boot" | "login" | "desktop";

interface PortfolioOSProps {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  resumeUrl: string | null;
}

const BOOT_DONE_KEY = "portfolio-boot-done";

export default function PortfolioOS({ profile, skills, projects, resumeUrl }: PortfolioOSProps) {
  // null until hydration — avoids server/client mismatch while reading localStorage
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    // Skip the boot sequence for returning visitors so the desktop loads instantly
    const alreadyBooted = localStorage.getItem(BOOT_DONE_KEY) === "1";
    if (alreadyBooted) {
      setPhase("desktop");
    } else {
      setPhase("bios");
    }
  }, []);

  const goToDesktop = () => {
    localStorage.setItem(BOOT_DONE_KEY, "1");
    setPhase("desktop");
    playStartup();
  };

  // Black screen during hydration — matches the page background, invisible to user
  if (phase === null) return <div style={{ width: "100vw", height: "100vh", background: "#000" }} />;

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {phase === "bios" && (
        <BiosScreen
          ownerName={profile?.name ?? "Developer"}
          onComplete={() => setPhase("boot")}
        />
      )}

      {phase === "boot" && (
        <BootScreen onComplete={() => setPhase("login")} />
      )}

      {phase === "login" && (
        <LoginScreen onLogin={goToDesktop} />
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
