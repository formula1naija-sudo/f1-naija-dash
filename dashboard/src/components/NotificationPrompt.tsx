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
    const res = await fetch(`${PUSH_SERVICE_URL}/vapid-public-key`);
    if (!res.ok) throw new Error("Failed to fetch VAPID key");
    const { publicKey } = await res.json();
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await fetch(`${PUSH_SERVICE_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existing),
      });
      return;
    }
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });
    await fetch(`${PUSH_SERVICE_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    console.log("Push subscription registered");
  } catch (err) {
    console.error("Push subscription failed:", err);
  }
}

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsIos(ios);
    setIsStandalone(standalone);

    // Already granted — subscribe silently (re-registers if needed)
    if (Notification.permission === "granted" && PUSH_SERVICE_URL) {
      subscribeToPush();
    }

    const delay = ios && !standalone ? 3000 : 5000;
    const timer = setTimeout(() => {
      if (Notification.permission === "default" || (ios && !standalone)) {
        setShow(true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestPermission = async () => {
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
