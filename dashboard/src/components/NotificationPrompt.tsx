"use client";
import { useEffect, useState } from "react";

const PUSH_SERVICE_URL = process.env.NEXT_PUBLIC_PUSH_SERVICE_URL || "";

async function subscribeToPush(): Promise<void> {
  if (!PUSH_SERVICE_URL) {
    console.warn("NEXT_PUBLIC_PUSH_SERVICE_URL not set, skipping push subscription");
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;

    // Fetch VAPID public key from the push service (public read-only endpoint)
    const res = await fetch(`${PUSH_SERVICE_URL}/vapid-public-key`);
    if (!res.ok) throw new Error("Failed to fetch VAPID key");
    const { publicKey } = await res.json();

    // If already subscribed, re-register to keep the server in sync
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existing),
      });
      return;
    }

    // Create a new push subscription with the server's VAPID key
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    // POST via the Next.js proxy — keeps the Railway push-service URL out of
    // the browser's network log and respects the same-origin policy
    const regRes = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    if (!regRes.ok) throw new Error(`Subscribe failed: ${regRes.status}`);
    console.log("Push subscription registered successfully");
  } catch (err) {
    console.error("Push subscription failed:", err);
  }
}

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [isIos] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? /iphone|ipad|ipod/i.test(navigator.userAgent)
      : false
  );
  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    // Guard: iOS Safari < 16.4 has no Notification API — accessing it throws ReferenceError
    const hasNotification = typeof Notification !== "undefined";

    // Already granted — subscribe silently on mount (re-registers if needed)
    if (hasNotification && Notification.permission === "granted" && PUSH_SERVICE_URL) {
      subscribeToPush();
    }

    // iOS (and sometimes Android) can invalidate VAPID subscriptions when the PWA
    // is force-quit, the device restarts, or the OS cleans up background workers.
    // Re-subscribing on every visibility-change ensures the push service always
    // holds a valid endpoint for this device, so notifications keep arriving after
    // the user returns to the app from the home screen or app switcher.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        hasNotification &&
        Notification.permission === "granted" &&
        PUSH_SERVICE_URL
      ) {
        subscribeToPush();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    const delay = isIos && !isStandalone ? 3000 : 5000;
    const timer = setTimeout(() => {
      const notifDefault = hasNotification && Notification.permission === "default";
      if (notifDefault || (isIos && !isStandalone)) {
        setShow(true);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isIos, isStandalone]);

  const handleRequestPermission = async () => {
    if (typeof Notification === "undefined") { setShow(false); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await subscribeToPush();
    }
    setShow(false);
  };

  if (!show) return null;

  // iOS not in standalone: prompt to add to Home Screen
  if (isIos && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-zinc-900 border border-zinc-700 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📲</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Add to Home Screen</p>
            <p className="text-xs text-zinc-400 mt-1">
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to get live F1 push notifications.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-zinc-500 hover:text-zinc-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Standard browser: request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-zinc-900 border border-zinc-700 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Enable Notifications</p>
            <p className="text-xs text-zinc-400 mt-1">
              Get live alerts for Safety Cars, Red Flags, and key race moments.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-zinc-500 hover:text-zinc-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleRequestPermission}
            className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2"
          >
            Allow Notifications
          </button>
          <button
            onClick={() => setShow(false)}
            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 px-3"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  return null;
}
