import { NextRequest, NextResponse } from "next/server";
import * as webpush from "web-push";
import fs from "fs";
import path from "path";

// Force dynamic rendering — this route uses fs and env vars at runtime
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
    // Auth check
    const authHeader = req.headers.get("authorization");
    const secret = process.env.NOTIFY_SECRET;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // VAPID setup (done per-request so env vars are always available)
    const vapidSubject = process.env.VAPID_SUBJECT;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 }
      );
    }
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const { title, body } = (await req.json()) as {
      title?: string;
      body?: string;
    };

    const payload = JSON.stringify({
      title: title ?? "\u{1F3CE}\uFE0F F1 Naija News",
      body: body ?? "New F1 update just dropped!",
      url: "/news",
      icon: "/icon.png",
    });

    const subs = readSubscriptions();
    const validSubs: StoredSubscription[] = [];
    let sent = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          sub as webpush.PushSubscription,
          payload
        );
        validSubs.push(sub);
        sent++;
      } catch (err: unknown) {
        // Remove subscriptions that are gone (410 = Gone, 404 = Not Found)
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          console.log(
            "Removing expired subscription:",
            (sub.endpoint ?? "").slice(0, 50)
          );
        } else {
          // Keep subscription — transient error
          validSubs.push(sub);
          console.error("Push error:", (err as Error).message);
        }
      }
    }

    writeSubscriptions(validSubs);
    return NextResponse.json({ success: true, sent, total: subs.length });
  } catch (err) {
    console.error("Notify route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
