"use client";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationPrompt() {
    const [showBanner, setShowBanner] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    useNotifications();

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;
        if (Notification.permission === "default") {
            const timer = setTimeout(() => setShowBanner(true), 5000);
            return () => clearTimeout(timer);
        }
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

    return (
        <div className="fixed top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-lg">
            <span className="text-sm text-zinc-300">🔔 Get alerts for overtakes, red flags & more</span>
            <button
                onClick={handleEnable}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
                Enable
            </button>
            <button
                onClick={handleDismiss}
                className="text-sm text-zinc-500 transition hover:text-zinc-300"
            >
                ✕
            </button>
        </div>
    );
}
