import { createClient } from "@/lib/supabase.server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: contactCount }, { count: projectCount }, { data: projects }] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("view_count"),
  ]);

  const { count: unreadCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  const totalViews = projects?.reduce((sum, p) => sum + (p.view_count ?? 0), 0) ?? 0;

  const stats = [
    { label: "Total Projects", value: projectCount ?? 0, icon: "📁" },
    { label: "Total Messages", value: contactCount ?? 0, icon: "✉️" },
    { label: "Unread Messages", value: unreadCount ?? 0, icon: "🔔", alert: (unreadCount ?? 0) > 0 },
    { label: "Total Project Views", value: totalViews.toLocaleString(), icon: "👁" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: "#525252", fontSize: 14 }}>
          Welcome back. Here&apos;s an overview of your portfolio.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#111",
              border: `1px solid ${stat.alert ? "#3a1a1a" : "#1f1f1f"}`,
              borderRadius: 10,
              padding: "20px 20px",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: stat.alert ? "#f87171" : "#e5e5e5",
                marginBottom: 4,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "#525252" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#111",
          border: "1px solid #1f1f1f",
          borderRadius: 10,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "#e5e5e5", marginBottom: 16 }}>
          Quick Links
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { href: "/admin/profile", label: "Edit Profile" },
            { href: "/admin/projects", label: "Manage Projects" },
            { href: "/admin/skills", label: "Manage Skills" },
            { href: "/admin/contacts", label: "View Messages" },
            { href: "/admin/resume", label: "Upload Resume" },
            { href: "/", label: "View Portfolio ↗", external: true },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              style={{
                padding: "8px 16px",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                color: "#a3a3a3",
                textDecoration: "none",
                fontSize: 13,
                transition: "color 0.15s",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
