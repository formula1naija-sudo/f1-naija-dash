"use client";

import { useState } from "react";

const STORAGE_KEY = "f1naija_banner_dismissed_v2";

export default function AdBanner() {
  // Lazy initializer — reads localStorage once on mount, no effect needed
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !!localStorage.getItem(STORAGE_KEY);
  });
  const [fading, setFading] = useState(false);

  function dismiss() {
    setFading(true);
    setTimeout(() => {
      setDismissed(true);
      localStorage.setItem(STORAGE_KEY, "1");
    }, 400);
  }

  if (dismissed) return null;

  return (
    <div
      className="relative flex w-full flex-wrap items-center justify-center gap-3 px-10 py-2.5"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s",
        background: "linear-gradient(90deg,rgba(0,212,132,.15) 0%,rgba(0,212,132,.08) 50%,rgba(0,212,132,.15) 100%)",
        borderBottom: "1px solid rgba(0,212,132,.15)",
      }}
    >
      <span className="text-sm font-semibold" style={{ color: "var(--f1-text)" }}>
        🇳🇬 Join 5,000+ Naija F1 fans
      </span>
      <div className="flex items-center gap-2">
        <a
          href="https://www.instagram.com/f1_naija/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-3 py-1 text-xs font-bold transition active:scale-95"
          style={{
            background: "rgba(0,212,132,.2)",
            border: "1px solid rgba(0,212,132,.35)",
            color: "#00d484",
          }}
        >
          Instagram ↗
        </a>
        <a
          href="https://x.com/f1_naija"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-3 py-1 text-xs font-bold transition active:scale-95"
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)",
            color: "var(--f1-text)",
          }}
        >
          @f1_naija ↗
        </a>
      </div>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full transition"
        style={{ color: "var(--f1-muted)" }}
        aria-label="Dismiss banner"
      >
        &#x2715;
      </button>
    </div>
  );
}
