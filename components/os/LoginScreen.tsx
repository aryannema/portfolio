"use client";

import { useState, useEffect, useRef } from "react";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [cancelMsg, setCancelMsg] = useState(false);
  const [shake, setShake] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const handleOk = () => {
    onLogin();
  };

  const handleCancel = () => {
    setCancelMsg(true);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleOk();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000080",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backgroundImage:
          "radial-gradient(ellipse at 60% 40%, #0000a8 0%, #000080 50%, #000060 100%)",
      }}
      onKeyDown={handleKeyDown}
    >
      {/* DevOS 98 logo watermark top-left */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 32,
          fontFamily: "MS Sans Serif, Arial, sans-serif",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: "bold", color: "#fff", letterSpacing: -1 }}>
            DevOS
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: "bold",
              color: "#ffcc00",
              fontStyle: "italic",
              letterSpacing: 1,
            }}
          >
            98
          </span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
          © 2025 DevOS. All rights reserved.
        </div>
      </div>

      {/* Login dialog */}
      <div
        className={shake ? "login-shake" : ""}
        style={{
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          boxShadow: "4px 4px 0 #000",
          width: 320,
          fontFamily: "MS Sans Serif, Arial, sans-serif",
          fontSize: 11,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "#000080",
            color: "#fff",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: "bold",
            fontSize: 11,
          }}
        >
          <span style={{ fontSize: 13 }}>🔐</span>
          <span style={{ flex: 1 }}>Enter Network Password</span>
          <button
            onClick={handleCancel}
            style={{
              width: 16,
              height: 14,
              background: "#c0c0c0",
              border: "2px solid",
              borderColor: "#ffffff #808080 #808080 #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 9,
              fontWeight: "bold",
              color: "#000",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 16px 12px" }}>
          {/* Header row */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                background: "#fff",
                border: "2px inset #808080",
              }}
            >
              🖥️
            </div>
            <div style={{ lineHeight: 1.6 }}>
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>Welcome to DevOS 98</div>
              <div style={{ color: "#444" }}>
                Type your password to begin your session.
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#808080", marginBottom: 14, marginTop: -4 }} />

          {/* Username */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <label style={{ width: 80, textAlign: "right", flexShrink: 0 }}>User name:</label>
            <input
              type="text"
              value="Guest"
              readOnly
              style={{
                flex: 1,
                background: "#d4d0c8",
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                padding: "2px 4px",
                fontFamily: "MS Sans Serif, Arial, sans-serif",
                fontSize: 11,
                color: "#444",
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <label style={{ width: 80, textAlign: "right", flexShrink: 0 }}>Password:</label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              style={{
                flex: 1,
                background: "#ffffff",
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                padding: "2px 4px",
                fontFamily: "MS Sans Serif, Arial, sans-serif",
                fontSize: 11,
                outline: "none",
              }}
            />
          </div>

          {/* Cancel message */}
          {cancelMsg && (
            <div
              style={{
                border: "2px inset #808080",
                background: "#fff",
                padding: "5px 8px",
                color: "#800000",
                marginBottom: 12,
                fontSize: 11,
              }}
            >
              ⚠️ You must log in to use this computer.
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <button
              className="win95-btn"
              onClick={handleOk}
              style={{ minWidth: 75, fontWeight: "bold" }}
            >
              OK
            </button>
            <button
              className="win95-btn"
              onClick={handleCancel}
              style={{ minWidth: 75 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          fontFamily: "MS Sans Serif, Arial, sans-serif",
          textAlign: "center",
        }}
      >
        Press Enter or click OK to log in
      </div>

      <style>{`
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .login-shake { animation: login-shake 0.4s ease-out; }
      `}</style>
    </div>
  );
}
