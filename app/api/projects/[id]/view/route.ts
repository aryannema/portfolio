import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase.server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase.rpc("increment_view_count", {
      project_id: id,
    });

    if (error) {
      console.error("View count error:", error);
      return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("View route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
