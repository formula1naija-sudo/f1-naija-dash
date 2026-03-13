"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    OneSignal?: {
      Slidedown: { promptPush: () => void };
      User: { PushSubscription: { optedIn: boolean } };
    };
  }
}

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only activate if OneSignal has a real (non-placeholder) app ID configured
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || appId === "your_onesignal_app_id_here") return;
    if (localStorage.getItem("pushPromptDismissed")) return;
    const timer = setTimeout(() => {
      const optedIn = window.OneSignal?.User?.PushSubscription?.optedIn;
      if (!optedIn) setVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || dismissed) return null;

  const handleEnable = () => {
    window.OneSignal?.Slidedown?.promptPush();
    localStorage.setItem("pushPromptDismissed", "1");
    setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem("pushPromptDismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-[#008751] px-4 py-2 text-white shadow-lg">
      <p className="text-sm font-medium">
        🏎️ Get live F1 race alerts — safety cars, red flags &amp; more
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={handleEnable}
          className="rounded bg-white px-3 py-1 text-sm font-semibold text-[#008751] hover:bg-gray-100"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="rounded px-2 py-1 text-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
