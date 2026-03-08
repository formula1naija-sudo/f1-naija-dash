"use client";

import { useState, useEffect } from "react";

const AUTO_DISMISS_MS = 30_000; // 30 seconds

export default function AdBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), AUTO_DISMISS_MS - 600);
    const dismissTimer = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="flex w-full items-center justify-center gap-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-4 py-2.5 transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <span className="text-sm font-semibold text-white">
        📢 Want your brand in front of F1 fans? Advertise with us →
      </span>
      <a
        href="mailto:ads@f1naija.com"
        className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/30"
      >
        ads@f1naija.com
      </a>
      <button
        onClick={() => { setFading(true); setTimeout(() => setDismissed(true), 500); }}
        className="absolute right-4 text-white/60 transition hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
