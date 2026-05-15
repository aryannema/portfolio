import { createClient } from "@/lib/supabase.server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
        {children}
      </main>
    </div>
  );
}
