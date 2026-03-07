import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force dynamic rendering — this route uses fs at runtime
export const dynamic = "force-dynamic";

const SUBS_FILE = path.join("/tmp", "f1-naija-push-subscriptions.json");

interface StoredSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys?: Record<string, string>;
}

function readSubscriptions(): StoredSubscription[] {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBS_FILE, "utf-8")) as StoredSubscription[];
    }
  } catch {}
  return [];
}

function writeSubscriptions(subs: StoredSubscription[]) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const subscription = (await req.json()) as StoredSubscription;
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    const subs = readSubscriptions();
    const exists = subs.some((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
      subs.push(subscription);
      writeSubscriptions(subs);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = (await req.json()) as { endpoint?: string };
    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }
    const subs = readSubscriptions();
    const filtered = subs.filter((s) => s.endpoint !== endpoint);
    writeSubscriptions(filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const subs = readSubscriptions();
  return NextResponse.json({ count: subs.length });
}
