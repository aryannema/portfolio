import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase.server";
import { sendContactNotification, sendAutoReply } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Save to Supabase
    const { error: dbError } = await supabase.from("contacts").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      read: false,
    });

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    // Get profile name for auto-reply
    const { data: profile } = await supabase.from("profile").select("name").single();
    const ownerName = profile?.name ?? "The Developer";

    // Send emails (non-blocking — don't fail the request if email fails)
    await Promise.allSettled([
      sendContactNotification({ senderName: name, senderEmail: email, message }),
      sendAutoReply({ toName: name, toEmail: email, ownerName }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
