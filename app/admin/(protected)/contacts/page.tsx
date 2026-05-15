"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Contact } from "@/types";

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    setContacts(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("contacts").update({ read: true }).eq("id", id);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read: true } : c));
    setSelected((prev) => prev?.id === id ? { ...prev, read: true } : prev);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>Contact Messages</h1>
        <p style={{ color: "#525252", fontSize: 13 }}>
          {contacts.filter((c) => !c.read).length} unread of {contacts.length} total
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, height: "calc(100vh - 180px)" }}>
        {/* List */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "auto" }}>
          {contacts.length === 0 && (
            <div style={{ padding: 24, color: "#525252", fontSize: 13, textAlign: "center" }}>No messages yet.</div>
          )}
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelected(c); if (!c.read) markRead(c.id); }}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #141414",
                cursor: "pointer",
                background: selected?.id === c.id ? "#1a1a1a" : "transparent",
                borderLeft: `3px solid ${!c.read ? "#e5e5e5" : "transparent"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: c.read ? 400 : 600, color: c.read ? "#a3a3a3" : "#e5e5e5" }}>
                  {c.name}
                </span>
                {!c.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e5e5e5", flexShrink: 0, marginTop: 4 }} />}
              </div>
              <div style={{ fontSize: 11, color: "#525252", marginBottom: 4 }}>{c.email}</div>
              <div style={{ fontSize: 12, color: "#737373", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.message}
              </div>
              <div style={{ fontSize: 11, color: "#404040", marginTop: 6 }}>
                {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 28 }}>
          {selected ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#e5e5e5", marginBottom: 4 }}>{selected.name}</div>
                  <a href={`mailto:${selected.email}`} style={{ color: "#737373", fontSize: 13, textDecoration: "none" }}>{selected.email}</a>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`mailto:${selected.email}`}>
                    <button style={{ padding: "6px 16px", background: "#e5e5e5", color: "#0a0a0a", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Reply ↗
                    </button>
                  </a>
                  <button onClick={() => del(selected.id)} style={{ padding: "6px 16px", background: "transparent", border: "1px solid #3a1a1a", borderRadius: 6, color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ color: "#525252", fontSize: 12, marginBottom: 20 }}>
                {new Date(selected.created_at).toLocaleString()} · {selected.read ? "Read" : "Unread"}
              </div>
              <div
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #1f1f1f",
                  borderRadius: 8,
                  padding: 20,
                  color: "#d4d4d4",
                  fontSize: 14,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selected.message}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#525252", fontSize: 14 }}>
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
