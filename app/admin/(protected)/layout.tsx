import { createClient } from "@/lib/supabase.server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const ALLOWED_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Reject any authenticated user whose email doesn't match the owner's.
  // This covers both email/password login and OAuth (Google or otherwise).
  if (ALLOWED_EMAIL && user.email?.toLowerCase() !== ALLOWED_EMAIL) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
        {children}
      </main>
    </div>
  );
}
