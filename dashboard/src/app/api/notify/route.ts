import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.NOTIFY_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Notifications are sent directly by the Railway push-service.
  // This endpoint is kept as a no-op stub so existing callers don't 404.
  return NextResponse.json({ success: true, sent: 0, message: "Use Railway push-service for notifications" });
}
