"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid credentials.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 360,
          background: "#111",
          border: "1px solid #1f1f1f",
          borderRadius: 12,
          padding: 32,
        }}
      >
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⊞</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#e5e5e5" }}>Admin Login</div>
          <div style={{ fontSize: 13, color: "#525252", marginTop: 4 }}>Portfolio OS Dashboard</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                color: "#e5e5e5",
                fontSize: 14,
                outline: "none",
              }}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                color: "#e5e5e5",
                fontSize: 14,
                outline: "none",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              style={{
                background: "#1a0a0a",
                border: "1px solid #3a1a1a",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              background: loading ? "#1a1a1a" : "#e5e5e5",
              color: loading ? "#525252" : "#0a0a0a",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
