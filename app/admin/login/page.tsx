"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

// useSearchParams() must live inside a Suspense boundary in Next.js 15
function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    urlError === "unauthorized" ? "Access denied. This account is not authorised." :
    urlError === "auth-failed"  ? "Google sign-in failed. Try again." : ""
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setError("");
    setOauthLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });
    if (error) {
      setError("Google sign-in failed. Try again.");
      setOauthLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    color: "#e5e5e5",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ width: 360, background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, padding: 32 }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⊞</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#e5e5e5" }}>Admin Login</div>
        <div style={{ fontSize: 13, color: "#525252", marginTop: 4 }}>Portfolio OS Dashboard</div>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleLogin}
        disabled={oauthLoading || loading}
        style={{
          width: "100%", padding: "10px",
          background: oauthLoading ? "#1a1a1a" : "#18181b",
          color: oauthLoading ? "#525252" : "#e5e5e5",
          border: "1px solid #2a2a2a", borderRadius: 6,
          fontSize: 14, fontWeight: 500,
          cursor: oauthLoading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          marginBottom: 20,
        }}
      >
        {oauthLoading ? "Redirecting..." : <><GoogleIcon /> Continue with Google</>}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
        <span style={{ fontSize: 12, color: "#404040" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
      </div>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required style={inputStyle} placeholder="admin@example.com"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#737373", marginBottom: 6 }}>Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required style={inputStyle} placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#f87171" }}>
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading || oauthLoading}
          style={{
            padding: "10px",
            background: loading ? "#1a1a1a" : "#e5e5e5",
            color: loading ? "#525252" : "#0a0a0a",
            border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Suspense fallback={<div style={{ width: 360, height: 400, background: "#111", border: "1px solid #1f1f1f", borderRadius: 12 }} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
