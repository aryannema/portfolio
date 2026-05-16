"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useWindowManager, WindowId } from "./WindowManager";
import { useIsMobile } from "@/lib/useIsMobile";
import Screensaver from "./Screensaver";
import Win95Window from "./Win95Window";
import Taskbar from "./Taskbar";
import AboutWindow from "./AboutWindow";
import SkillsWindow from "./SkillsWindow";
import ProjectsWindow from "./ProjectsWindow";
import ContactWindow from "./ContactWindow";
import SnakeWindow from "./SnakeWindow";
import VirusWindow from "./VirusWindow";
import MinesweeperWindow from "./MinesweeperWindow";
import ResumeWindow from "./ResumeWindow";
import TerminalWindow from "./TerminalWindow";
import { Profile, Skill, Project } from "@/types";

interface DesktopIcon {
  id: WindowId;
  label: string;
  icon: string;
  x: number;
  y: number;
}

const ICONS: DesktopIcon[] = [
  { id: "about",       label: "About Me",      icon: "🧑‍💻", x: 16,  y: 16  },
  { id: "projects",    label: "Projects",      icon: "📁", x: 16,  y: 100 },
  { id: "skills",      label: "Skills.txt",    icon: "📄", x: 16,  y: 184 },
  { id: "contact",     label: "Contact.exe",   icon: "✉️", x: 16,  y: 268 },
  { id: "resume",      label: "Resume.pdf",    icon: "📋", x: 16,  y: 352 },
  { id: "snake",       label: "Snake.exe",     icon: "🐍", x: 96,  y: 16  },
  { id: "minesweeper", label: "Minesweeper",   icon: "💣", x: 96,  y: 100 },
  { id: "virus",       label: "VirusScan.exe", icon: "🛡️", x: 96,  y: 184 },
  { id: "terminal",    label: "Terminal",      icon: "💻", x: 96,  y: 268 },
];

interface DesktopProps {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  resumeUrl: string | null;
}

interface ContextMenu {
  x: number;
  y: number;
}

interface Wallpaper {
  bg: string;
  pattern: string;
}

const WALLPAPERS: Wallpaper[] = [
  { bg: "#008080", pattern: "repeating-linear-gradient(45deg, rgba(0,100,100,0.12) 0, rgba(0,100,100,0.12) 1px, transparent 1px, transparent 8px)" },
  { bg: "#001a4d", pattern: "repeating-linear-gradient(45deg, rgba(0,40,120,0.2) 0, rgba(0,40,120,0.2) 1px, transparent 1px, transparent 8px)" },
  { bg: "#1a4a1a", pattern: "repeating-linear-gradient(45deg, rgba(0,80,0,0.15) 0, rgba(0,80,0,0.15) 1px, transparent 1px, transparent 8px)" },
  { bg: "#3d0057", pattern: "repeating-linear-gradient(-45deg, rgba(100,0,160,0.2) 0, rgba(100,0,160,0.2) 1px, transparent 1px, transparent 8px)" },
  { bg: "#5c0011", pattern: "repeating-linear-gradient(45deg, rgba(140,0,20,0.2) 0, rgba(140,0,20,0.2) 1px, transparent 1px, transparent 8px)" },
  { bg: "#1a2a3f", pattern: "repeating-linear-gradient(-45deg, rgba(40,80,140,0.15) 0, rgba(40,80,140,0.15) 1px, transparent 1px, transparent 10px)" },
  { bg: "#0a0a18", pattern: "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px) 0 0 / 22px 22px" },
  { bg: "#3a3000", pattern: "repeating-linear-gradient(45deg, rgba(100,80,0,0.2) 0, rgba(100,80,0,0.2) 1px, transparent 1px, transparent 8px)" },
];

export default function Desktop({ profile, skills, projects, resumeUrl }: DesktopProps) {
  const { windows, openWindow } = useWindowManager();
  const desktopRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [wallpaper] = useState<Wallpaper>(() => WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)]);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<WindowId | null>(null);
  const [screensaver, setScreensaver] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const IDLE_MS = 30_000;

  // Reset idle timer on any user activity
  useEffect(() => {
    const bump = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("mousemove", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("mousedown", bump);
    window.addEventListener("touchstart", bump);
    return () => {
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("mousedown", bump);
      window.removeEventListener("touchstart", bump);
    };
  }, []);

  // Check idle every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_MS) {
        setScreensaver(true);
      }
    }, 5_000);
    return () => clearInterval(interval);
  }, []);

  const handleIconDblClick = (id: WindowId) => {
    openWindow(id);
    setSelectedIcon(null);
  };

  const handleIconClick = (e: React.MouseEvent, id: WindowId) => {
    e.stopPropagation();
    setSelectedIcon(id);
    setContextMenu(null);
  };

  const handleDesktopClick = () => {
    setSelectedIcon(null);
    setContextMenu(null);
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!desktopRef.current) return;
    const rect = desktopRef.current.getBoundingClientRect();
    setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelectedIcon(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: wallpaper.bg }}>
      {/* Desktop area */}
      <div
        ref={desktopRef}
        style={{ flex: 1, position: "relative", overflow: isMobile ? "auto" : "hidden" }}
        onClick={handleDesktopClick}
        onContextMenu={isMobile ? undefined : handleContextMenu}
      >
        {/* Subtle tiled wallpaper pattern */}
        <div
          style={{
            position: isMobile ? "fixed" : "absolute",
            inset: 0,
            backgroundImage: wallpaper.pattern,
            pointerEvents: "none",
          }}
        />

        {isMobile ? (
          /* ── Mobile: scrollable 2-col icon grid ── */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
              padding: 16,
              alignContent: "start",
            }}
          >
            {ICONS.map((icon) => (
              <div
                key={icon.id}
                onClick={(e) => { e.stopPropagation(); openWindow(icon.id); }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 8px",
                  background: "rgba(0,0,0,0.15)",
                  borderRadius: 4,
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ fontSize: 44, lineHeight: 1 }}>{icon.icon}</div>
                <div className="icon-label" style={{ color: "#fff", fontSize: 12 }}>{icon.label}</div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Desktop: absolute-positioned icons ── */
          <>
            {ICONS.map((icon) => (
              <div
                key={icon.id}
                className={`desktop-icon${selectedIcon === icon.id ? " selected" : ""}`}
                style={{ left: icon.x, top: icon.y }}
                onClick={(e) => handleIconClick(e, icon.id)}
                onDoubleClick={() => handleIconDblClick(icon.id)}
              >
                <div
                  className="icon-img-wrap"
                  style={{
                    fontSize: 36,
                    lineHeight: 1,
                    background: selectedIcon === icon.id ? "rgba(0,0,128,0.5)" : "transparent",
                    outline: selectedIcon === icon.id ? "1px dotted rgba(255,255,255,0.8)" : "none",
                  }}
                >
                  {icon.icon}
                </div>
                <div
                  className="icon-label"
                  style={{
                    background: selectedIcon === icon.id ? "#000080" : "transparent",
                    color: "#fff",
                  }}
                >
                  {icon.label}
                </div>
              </div>
            ))}

            {/* Right-click context menu */}
            {contextMenu && (
              <div
                style={{
                  position: "absolute",
                  left: contextMenu.x,
                  top: contextMenu.y,
                  background: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#ffffff #808080 #808080 #ffffff",
                  boxShadow: "2px 2px 0 #000",
                  zIndex: 9000,
                  minWidth: 160,
                  fontSize: 11,
                  fontFamily: "MS Sans Serif, Arial, sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { label: "Arrange Icons", icon: "▤", action: () => setContextMenu(null) },
                  { label: "Refresh", icon: "↻", action: () => { setContextMenu(null); } },
                  null,
                  { label: "New Folder", icon: "📁", action: () => setContextMenu(null) },
                  null,
                  { label: "Properties", icon: "ℹ️", action: () => { openWindow("about"); setContextMenu(null); } },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} style={{ height: 1, background: "#808080", margin: "2px 4px" }} />
                  ) : (
                    <div
                      key={item.label}
                      onClick={item.action}
                      style={{
                        padding: "4px 20px 4px 8px",
                        cursor: "default",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "#000080";
                        (e.currentTarget as HTMLDivElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                        (e.currentTarget as HTMLDivElement).style.color = "#000";
                      }}
                    >
                      <span style={{ width: 16, textAlign: "center", fontSize: 12 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* ABOUT */}
        <Win95Window id="about" desktopRef={desktopRef} isMobile={isMobile} menuItems={["File", "Edit", "View", "Help"]} statusText="Ready">
          <AboutWindow profile={profile} />
        </Win95Window>

        {/* SKILLS */}
        <Win95Window id="skills" desktopRef={desktopRef} isMobile={isMobile} menuItems={["File", "Edit", "Format", "Help"]} statusText={`${skills.length} skills loaded`}>
          <SkillsWindow skills={skills} />
        </Win95Window>

        {/* PROJECTS */}
        <Win95Window id="projects" desktopRef={desktopRef} isMobile={isMobile} menuItems={["File", "View", "Go", "Help"]} statusText={`${projects.length} project(s)`}>
          <ProjectsWindow projects={projects} />
        </Win95Window>

        {/* CONTACT */}
        <Win95Window id="contact" desktopRef={desktopRef} isMobile={isMobile} menuItems={["File", "Help"]} statusText="Ready to send">
          <ContactWindow />
        </Win95Window>

        {/* RESUME */}
        <Win95Window id="resume" desktopRef={desktopRef} isMobile={isMobile} statusText={resumeUrl ? "resume.pdf — 1 file" : "No file"}>
          <ResumeWindow resumeUrl={resumeUrl} />
        </Win95Window>

        {/* SNAKE */}
        <Win95Window id="snake" desktopRef={desktopRef} isMobile={isMobile} statusText="Arrow keys to play">
          <SnakeWindow />
        </Win95Window>

        {/* MINESWEEPER */}
        <Win95Window id="minesweeper" desktopRef={desktopRef} isMobile={isMobile} statusText="Right-click to flag">
          <MinesweeperWindow />
        </Win95Window>

        {/* VIRUS */}
        <Win95Window id="virus" desktopRef={desktopRef} isMobile={isMobile} statusText="DevAntivirus 98">
          <VirusWindow />
        </Win95Window>

        {/* TERMINAL */}
        <Win95Window id="terminal" desktopRef={desktopRef} isMobile={isMobile} statusText='Type "help" for commands'>
          <TerminalWindow profile={profile} />
        </Win95Window>
      </div>

      {/* Taskbar */}
      <Taskbar onOpenWindow={openWindow} />

      {/* Screensaver */}
      {screensaver && (
        <Screensaver onDismiss={() => {
          lastActivityRef.current = Date.now();
          setScreensaver(false);
        }} />
      )}
    </div>
  );
}
