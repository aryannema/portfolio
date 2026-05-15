"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type WindowId =
  | "about"
  | "projects"
  | "skills"
  | "contact"
  | "resume"
  | "snake"
  | "virus"
  | "minesweeper"
  | "terminal";

export interface WinState {
  id: WindowId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

const DEFAULT_WINDOWS: Record<WindowId, Omit<WinState, "isOpen" | "isMinimized" | "isMaximized" | "zIndex">> = {
  about:      { id: "about",      title: "About Me",        icon: "🧑‍💻", x: 80,  y: 40,  width: 420, height: 320 },
  projects:   { id: "projects",   title: "Projects",        icon: "📁", x: 120, y: 60,  width: 480, height: 380 },
  skills:     { id: "skills",     title: "Skills.txt",      icon: "📄", x: 160, y: 50,  width: 380, height: 320 },
  contact:    { id: "contact",    title: "Contact.exe",     icon: "✉️", x: 200, y: 70,  width: 380, height: 340 },
  resume:     { id: "resume",     title: "Resume.pdf",      icon: "📋", x: 120, y: 40,  width: 520, height: 560 },
  snake:      { id: "snake",      title: "Snake.exe",       icon: "🐍", x: 100, y: 50,  width: 300, height: 320 },
  virus:      { id: "virus",      title: "VirusScan 98",    icon: "🛡️", x: 160, y: 60,  width: 380, height: 280 },
  minesweeper:{ id: "minesweeper",title: "Minesweeper",     icon: "💣", x: 120, y: 55,  width: 340, height: 380 },
  terminal:   { id: "terminal",   title: "Terminal",        icon: "💻", x: 160, y: 60,  width: 520, height: 360 },
};

interface WindowManagerCtx {
  windows: Record<WindowId, WinState>;
  activeWindowId: WindowId | null;
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  toggleMaximize: (id: WindowId, desktopW: number, desktopH: number) => void;
  bringToFront: (id: WindowId) => void;
  updatePosition: (id: WindowId, x: number, y: number) => void;
  updateSize: (id: WindowId, w: number, h: number) => void;
}

const WindowManagerContext = createContext<WindowManagerCtx | null>(null);

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [topZ, setTopZ] = useState(10);
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>(null);
  const [windows, setWindows] = useState<Record<WindowId, WinState>>(() => {
    const init: Partial<Record<WindowId, WinState>> = {};
    for (const [id, def] of Object.entries(DEFAULT_WINDOWS)) {
      init[id as WindowId] = { ...def, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10 };
    }
    return init as Record<WindowId, WinState>;
  });

  const getNextZ = useCallback(() => {
    setTopZ((z) => z + 1);
    return topZ + 1;
  }, [topZ]);

  const openWindow = useCallback((id: WindowId) => {
    setActiveWindowId(id);
    setTopZ((z) => {
      const newZ = z + 1;
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: newZ },
      }));
      return newZ;
    });
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setActiveWindowId((prev) => (prev === id ? null : prev));
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false },
    }));
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  }, []);

  const restoreWindow = useCallback((id: WindowId) => {
    setActiveWindowId(id);
    setTopZ((z) => {
      const newZ = z + 1;
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], isMinimized: false, zIndex: newZ },
      }));
      return newZ;
    });
  }, []);

  const toggleMaximize = useCallback((id: WindowId, desktopW: number, desktopH: number) => {
    setWindows((prev) => {
      const win = prev[id];
      if (win.isMaximized) {
        const def = DEFAULT_WINDOWS[id];
        return { ...prev, [id]: { ...win, isMaximized: false, x: def.x, y: def.y, width: def.width, height: def.height } };
      }
      return { ...prev, [id]: { ...win, isMaximized: true, x: 0, y: 0, width: desktopW, height: desktopH } };
    });
  }, []);

  const bringToFront = useCallback((id: WindowId) => {
    setActiveWindowId(id);
    setTopZ((z) => {
      const newZ = z + 1;
      setWindows((prev) => ({ ...prev, [id]: { ...prev[id], zIndex: newZ } }));
      return newZ;
    });
  }, []);

  const updatePosition = useCallback((id: WindowId, x: number, y: number) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], x, y } }));
  }, []);

  const updateSize = useCallback((id: WindowId, w: number, h: number) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], width: w, height: h } }));
  }, []);

  return (
    <WindowManagerContext.Provider value={{
      windows, activeWindowId, openWindow, closeWindow, minimizeWindow, restoreWindow,
      toggleMaximize, bringToFront, updatePosition, updateSize,
    }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider");
  return ctx;
}
