"use client";

import { useEffect, useState } from "react";

type BannerType = "permission" | "ios-install" | null;

function getDeviceInfo() {
  if (typeof window === "undefined") {
    return { isIOS: false, isStandalone: false, supportsNotifications: false };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;
  const supportsNotifications = "Notification" in window;
  return { isIOS, isStandalone, supportsNotifications };
}

export default function NotificationPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bannerType, setBannerType] = useState<BannerType>(null);

  useEffect(() => {
    const { isIOS, isStandalone, supportsNotifications } = getDeviceInfo();

    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => {
        setBannerType("ios-install");
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (!supportsNotifications) return;
    if (Notification.permission !== "default") return;

    const timer = setTimeout(() => {
      setBannerType("permission");
      setShowBanner(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      new Notification("🏎️ F1 Naija Notifications Active!", {
        body: "You'll get alerts for overtakes, red flags, fastest laps and more.",
        icon: "/tag-logo.png",
      });
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
  };

  if (!showBanner || dismissed) return null;

  if (bannerType === "ios-install") {
    return (
      <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-zinc-500 transition hover:text-zinc-300"
          aria-label="Dismiss"
        >
          ✕
        </button>
        <p className="mb-1 pr-4 text-sm font-semibold text-white">
          📲 Enable F1 Notifications on iPhone
        </p>
        <p className="text-xs leading-relaxed text-zinc-400">
          Tap the{" "}
          <span className="font-medium text-zinc-200">Share</span>{" "}
          <span className="text-zinc-500">(□↑)</span> button, then{" "}
          <span className="font-medium text-zinc-200">Add to Home Screen</span>{" "}
          to get overtake, red flag &amp; fastest lap alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-lg">
      <span className="text-sm text-zinc-300">🔔 Get alerts for overtakes, red flags &amp; more</span>
      <button
        onClick={handleEnable}
        className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-emerald-500"
      >
        Enable
      </button>
      <button
        onClick={handleDismiss}
        className="text-sm text-zinc-500 transition hover:text-zinc-300"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
