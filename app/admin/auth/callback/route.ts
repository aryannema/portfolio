import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase.server";

// Handles the OAuth redirect from Google (via Supabase).
// Supabase sends ?code=... here; we exchange it for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/admin`);
    }
  }

  // Something went wrong — send back to login with a flag
  return NextResponse.redirect(`${origin}/admin/login?error=auth-failed`);
}
