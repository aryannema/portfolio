import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Minimal wrapper — applies admin font/body class to ALL /admin/* routes
// including login. Auth check lives in (protected)/layout.tsx.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} admin-body`} style={{ height: "100vh" }}>
      {children}
    </div>
  );
}
