import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import fs from "fs";
import path from "path";

const SUBS_FILE = path.join("/tmp", "f1-naija-push-subscriptions.json");

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
    const authHeader = req.headers.get("authorization");
    const secret = process.env.NOTIFY_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body } = await req.json();

    const payload = JSON.stringify({
      title: title ?? "\u{1F3CE}\uFE0F F1 Naija News",
      body: body ?? "New F1 update just dropped!",
      url: "/news",
      icon: "/icon.png",
    });

    const subs = readSubscriptions();
    const validSubs: PushSubscriptionJSON[] = [];
    let sent = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub as webpush.PushSubscription, payload);
        validSubs.push(sub);
        sent++;
      } catch (err: unknown) {
        if (
          err instanceof webpush.WebPushError &&
          (err.statusCode === 410 || err.statusCode === 404)
        ) {
          console.log("Removing expired subscription:", sub.endpoint?.slice(0, 50));
        } else {
          validSubs.push(sub);
        }
      }
    }

    writeSubscriptions(validSubs);

    return NextResponse.json({ success: true, sent, total: subs.length });
  } catch (err) {
    console.error("Notify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
