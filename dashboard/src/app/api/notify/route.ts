import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PUSH_URL = (process.env.NEXT_PUBLIC_PUSH_SERVICE_URL ?? "").replace(/\/$/, "");

// Proxy POST /api/notify → push-service /test-push
// Lets the browser trigger a test notification without hitting Railway directly
// (avoids any CORS / mixed-content issues).
export async function POST() {
  if (!PUSH_URL) {
    return NextResponse.json({ error: "Push service not configured" }, { status: 503 });
  }
  try {
    const TEST_SECRET = process.env.TEST_PUSH_SECRET ?? "f1naija-test";
    const res = await fetch(`${PUSH_URL}/test-push?secret=${encodeURIComponent(TEST_SECRET)}`, { method: "GET" });
    const text = await res.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = { message: text }; }
    return NextResponse.json(body, { status: res.status });
  } catch (err) {
    console.error("[notify] test-push proxy failed:", err);
    return NextResponse.json({ error: "Push service unreachable" }, { status: 502 });
  }
}

// GET /api/notify → returns push service health + subscriber count
export async function GET() {
  if (!PUSH_URL) {
    return NextResponse.json({ status: "unconfigured", subscribers: 0 });
  }
  try {
    const res = await fetch(`${PUSH_URL}/health`);
    const data = await res.json();
    return NextResponse.json({ status: "ok", ...data });
  } catch {
    return NextResponse.json({ status: "unreachable", subscribers: 0 });
  }
}
