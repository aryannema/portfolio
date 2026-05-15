"use client";

import { useRef, useCallback, useEffect } from "react";
import { useWindowManager, WindowId } from "./WindowManager";
import { playWindowOpen, playWindowClose, playMinimize, playRestore, playClick } from "@/lib/sounds";

interface Win95WindowProps {
  id: WindowId;
  children: React.ReactNode;
  menuItems?: string[];
  statusText?: string;
  desktopRef: React.RefObject<HTMLDivElement>;
}

export default function Win95Window({
  id,
  children,
  menuItems,
  statusText,
  desktopRef,
}: Win95WindowProps) {
  const {
    windows,
    activeWindowId,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    bringToFront,
    updatePosition,
    updateSize,
  } = useWindowManager();

  const win = windows[id];
  const isActive = activeWindowId === id;
  const windowRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const resizeState = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Play open sound each time the window becomes visible (component mounts)
  useEffect(() => { playWindowOpen(); }, []);

  const onTitlebarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.isMaximized) return;
      e.preventDefault();
      bringToFront(id);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: win.x,
        startTop: win.y,
      };

      const onMove = (me: MouseEvent) => {
        if (!dragState.current || !desktopRef.current) return;
        const area = desktopRef.current.getBoundingClientRect();
        let nx = dragState.current.startLeft + (me.clientX - dragState.current.startX);
        let ny = dragState.current.startTop + (me.clientY - dragState.current.startY);
        nx = Math.max(0, Math.min(nx, area.width - win.width));
        ny = Math.max(0, Math.min(ny, area.height - win.height));
        updatePosition(id, nx, ny);
      };

      const onUp = () => {
        dragState.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [win, id, bringToFront, updatePosition, desktopRef]
  );

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: win.width,
        startH: win.height,
      };

      const onMove = (me: MouseEvent) => {
        if (!resizeState.current) return;
        const nw = Math.max(240, resizeState.current.startW + (me.clientX - resizeState.current.startX));
        const nh = Math.max(160, resizeState.current.startH + (me.clientY - resizeState.current.startY));
        updateSize(id, nw, nh);
      };

      const onUp = () => {
        resizeState.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [win, id, updateSize]
  );

  if (!win.isOpen || win.isMinimized) return null;

  const style: React.CSSProperties = {
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.height,
    zIndex: win.zIndex,
  };

  return (
    <div
      ref={windowRef}
      className="win95-window win95-window-opening"
      style={style}
      onMouseDown={() => bringToFront(id)}
    >
      {/* Title bar */}
      <div
        className="win95-titlebar"
        style={{ background: isActive ? "#000080" : "#808080" }}
        onMouseDown={onTitlebarMouseDown}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>{win.icon}</span>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {win.title}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="win95-titlebar-btn"
            onClick={(e) => { e.stopPropagation(); playMinimize(); minimizeWindow(id); }}
            title="Minimize"
          >
            <span style={{ marginBottom: 3, display: "block" }}>_</span>
          </button>
          <button
            className="win95-titlebar-btn"
            onClick={(e) => {
              e.stopPropagation();
              playClick();
              if (desktopRef.current) {
                toggleMaximize(id, desktopRef.current.offsetWidth, desktopRef.current.offsetHeight);
              }
            }}
            title={win.isMaximized ? "Restore" : "Maximize"}
          >
            {win.isMaximized ? "❐" : "□"}
          </button>
          <button
            className="win95-titlebar-btn"
            onClick={(e) => { e.stopPropagation(); playWindowClose(); closeWindow(id); }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Menu bar */}
      {menuItems && menuItems.length > 0 && (
        <div className="win95-menubar">
          {menuItems.map((item) => (
            <span key={item} className="win95-menubar-item">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        {children}
      </div>

      {/* Status bar */}
      {statusText !== undefined && (
        <div className="win95-statusbar">
          <div style={{ flex: 1, borderRight: "2px inset #808080", paddingRight: 8 }}>
            {statusText}
          </div>
          <div style={{ width: 80, paddingLeft: 8 }}>DevOS 98</div>
        </div>
      )}

      {/* Resize handle */}
      {!win.isMaximized && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            cursor: "se-resize",
            background:
              "repeating-linear-gradient(135deg, #808080 0, #808080 1px, transparent 1px, transparent 3px)",
          }}
        />
      )}
    </div>
  );
}
