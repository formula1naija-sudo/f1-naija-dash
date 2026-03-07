import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PUSH_URL = (process.env.NEXT_PUBLIC_PUSH_SERVICE_URL ?? "").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  if (!PUSH_URL) {
    return NextResponse.json({ error: "Push service not configured" }, { status: 503 });
  }
  const body = await req.text();
  const res = await fetch(`${PUSH_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(req: NextRequest) {
  if (!PUSH_URL) {
    return NextResponse.json({ error: "Push service not configured" }, { status: 503 });
  }
  const body = await req.text();
  const res = await fetch(`${PUSH_URL}/subscribe`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function GET() {
  if (!PUSH_URL) {
    return NextResponse.json({ count: 0 });
  }
  try {
    const res = await fetch(`${PUSH_URL}/health`);
    const data = (await res.json()) as { subscriptions?: number };
    return NextResponse.json({ count: data.subscriptions ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
