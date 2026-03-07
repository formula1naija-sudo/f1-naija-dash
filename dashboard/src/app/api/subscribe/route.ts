import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBS_FILE = path.join("/tmp", "f1-naija-push-subscriptions.json");

function readSubscriptions(): PushSubscriptionJSON[] {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function writeSubscriptions(subs: PushSubscriptionJSON[]) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
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
    const { endpoint } = await req.json();
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
