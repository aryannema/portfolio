import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase.server";
import { sendContactNotification, sendAutoReply } from "@/lib/mailer";

// In-memory rate limiter — 5 submissions per IP per minute.
// Works per serverless instance; good enough for a personal portfolio.
const ipTracker = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipTracker.get(ip);
  if (!entry || now > entry.resetAt) {
    ipTracker.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

function sanitize(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, "") // strip angle brackets to neutralise any HTML/script attempts
    .slice(0, 5000);       // hard length cap
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawName = String(body.name ?? "");
    const rawEmail = String(body.email ?? "");
    const rawMessage = String(body.message ?? "");

    if (!rawName.trim() || !rawEmail.trim() || !rawMessage.trim()) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Length guards before sanitizing
    if (rawName.length > 100 || rawEmail.length > 254 || rawMessage.length > 5000) {
      return NextResponse.json({ error: "Input exceeds maximum length" }, { status: 400 });
    }

    const name = sanitize(rawName);
    const email = rawEmail.trim().toLowerCase().slice(0, 254);
    const message = sanitize(rawMessage);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error: dbError } = await supabase.from("contacts").insert({
      name,
      email,
      message,
      read: false,
    });

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    const { data: profile } = await supabase.from("profile").select("name").single();
    const ownerName = profile?.name ?? "The Developer";

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
