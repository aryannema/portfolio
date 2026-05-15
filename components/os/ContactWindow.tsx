"use client";

import { useState, useEffect, useRef } from "react";
import { playError, playSuccess, playClick } from "@/lib/sounds";

type Phase = "form" | "sending" | "success" | "error";

// ── Reusable Win95 dialog overlay ────────────────────
function Win95Dialog({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(128,128,128,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          boxShadow: "2px 2px 0 #000",
          minWidth: 280,
          maxWidth: 320,
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
          <span>{icon}</span>
          <span style={{ flex: 1 }}>{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Progress bar component ───────────────────────────
function ProgressBar({ value }: { value: number }) {
  return (
    <div
      style={{
        height: 16,
        border: "2px solid",
        borderColor: "#808080 #ffffff #ffffff #808080",
        background: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: "#000080",
          transition: "width 0.15s linear",
        }}
      />
    </div>
  );
}

// ── Sending dialog ───────────────────────────────────
function SendingDialog({ email, progress }: { email: string; progress: number }) {
  const packets = Math.floor((progress / 100) * 128);
  return (
    <Win95Dialog title="Sending…" icon="📤">
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ marginBottom: 12, fontWeight: "bold" }}>
          Transmitting data to server…
        </div>
        <ProgressBar value={progress} />
        <div style={{ marginTop: 6, color: "#555", fontSize: 10, marginBottom: 12 }}>
          {progress < 100 ? `${Math.round(progress)}% complete` : "Finalizing…"}
        </div>
        <div
          style={{
            border: "2px inset #808080",
            background: "#fff",
            padding: "6px 8px",
            fontSize: 10,
            fontFamily: "Courier New, monospace",
            lineHeight: 1.7,
          }}
        >
          <div>From: <span style={{ color: "#000080" }}>{email || "visitor@client.dev"}</span></div>
          <div>To: <span style={{ color: "#000080" }}>portfolio@server.dev</span></div>
          <div>Packets sent: <span style={{ color: "#000080" }}>{packets}</span></div>
          <div>Status: <span style={{ color: progress < 100 ? "#808000" : "#008000" }}>
            {progress < 100 ? "TRANSMITTING" : "COMPLETE"}
          </span></div>
        </div>
      </div>
    </Win95Dialog>
  );
}

// ── MessageBox dialog ────────────────────────────────
function MessageBox({
  type,
  onOk,
}: {
  type: "success" | "error";
  onOk: () => void;
}) {
  const isSuccess = type === "success";
  return (
    <Win95Dialog title={isSuccess ? "Portfolio OS" : "Portfolio OS — Error"} icon={isSuccess ? "ℹ️" : "🚫"}>
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <span style={{ fontSize: 32, flexShrink: 0 }}>{isSuccess ? "✅" : "⚠️"}</span>
          <div style={{ lineHeight: 1.7 }}>
            {isSuccess ? (
              <>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>Message Transmitted!</div>
                <div style={{ color: "#333" }}>
                  Your message was saved successfully. An auto-reply has been sent to your email.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: "bold", color: "#800000", marginBottom: 4 }}>
                  Transmission Failed
                </div>
                <div style={{ color: "#333" }}>
                  Could not send your message. Please try again or email directly.
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="win95-btn"
            style={{ minWidth: 75 }}
            onClick={() => { playClick(); onOk(); }}
          >
            OK
          </button>
        </div>
      </div>
    </Win95Dialog>
  );
}

// ── Main component ────────────────────────────────────
export default function ContactWindow() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [phase, setPhase] = useState<Phase>("form");
  const [fieldError, setFieldError] = useState("");
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  // Fake progress animation while sending
  useEffect(() => {
    if (phase !== "sending") return;
    doneRef.current = false;
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (doneRef.current) return 100;
        // Slow down as it approaches 90
        const step = p < 60 ? 8 : p < 80 ? 4 : p < 90 ? 1.5 : 0;
        return Math.min(p + step + Math.random() * 3, 90);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [phase]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFieldError("All fields are required.");
      playError();
      return;
    }
    setFieldError("");
    setPhase("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      doneRef.current = true;
      setProgress(100);
      // Brief pause so the 100% state is visible
      await new Promise((r) => setTimeout(r, 600));
      if (!res.ok) throw new Error();
      playSuccess();
      setPhase("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      doneRef.current = true;
      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      playError();
      setPhase("error");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        background: "#c0c0c0",
        padding: 16,
        fontSize: 11,
        fontFamily: "MS Sans Serif, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Form (always rendered underneath dialogs) */}
      <div>
        {(["name", "email", "message"] as const).map((field) => (
          <div key={field} style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: 3, textTransform: "capitalize" }}>
              {field}:
            </label>
            {field === "message" ? (
              <textarea
                className="win95-input"
                style={{ width: "100%", height: 90, resize: "vertical" }}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Hello…"
                disabled={phase === "sending"}
              />
            ) : (
              <input
                className="win95-input"
                style={{ width: "100%" }}
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={field === "email" ? "your@email.com" : "Your name"}
                disabled={phase === "sending"}
              />
            )}
          </div>
        ))}

        {fieldError && (
          <div
            style={{
              border: "2px inset #808080",
              background: "#fff",
              padding: "5px 8px",
              color: "#800000",
              marginBottom: 10,
            }}
          >
            ⚠️ {fieldError}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="win95-btn"
            onClick={handleSubmit}
            disabled={phase === "sending"}
            style={{ flex: 1 }}
          >
            📤 Send Message
          </button>
          <button
            className="win95-btn"
            onClick={() => { setForm({ name: "", email: "", message: "" }); setFieldError(""); }}
            disabled={phase === "sending"}
          >
            Clear
          </button>
        </div>

        <div style={{ marginTop: 12, borderTop: "1px solid #808080", paddingTop: 10, fontSize: 10, color: "#555" }}>
          💡 Your message is saved and you&apos;ll receive an auto-reply within 24–48 hours.
        </div>
      </div>

      {/* Sending progress dialog */}
      {phase === "sending" && (
        <SendingDialog email={form.email} progress={progress} />
      )}

      {/* Success / Error MessageBox */}
      {(phase === "success" || phase === "error") && (
        <MessageBox
          type={phase}
          onOk={() => setPhase("form")}
        />
      )}
    </div>
  );
}
