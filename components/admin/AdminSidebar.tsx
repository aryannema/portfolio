"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/profile", label: "Profile", icon: "👤" },
  { href: "/admin/projects", label: "Projects", icon: "📁" },
  { href: "/admin/skills", label: "Skills", icon: "📊" },
  { href: "/admin/contacts", label: "Contacts", icon: "✉️" },
  { href: "/admin/resume", label: "Resume", icon: "📋" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside
      style={{
        width: 220,
        background: "#0a0a0a",
        borderRight: "1px solid #1f1f1f",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1f1f1f" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e5e5", letterSpacing: 0.5 }}>
          Portfolio OS
        </div>
        <div style={{ fontSize: 11, color: "#525252", marginTop: 2 }}>Admin Dashboard</div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  color: active ? "#e5e5e5" : "#737373",
                  background: active ? "#1a1a1a" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
                {active && (
                  <div
                    style={{
                      marginLeft: "auto",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#e5e5e5",
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 12px", borderTop: "1px solid #1f1f1f" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "1px solid #1f1f1f",
            borderRadius: 6,
            color: "#737373",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
