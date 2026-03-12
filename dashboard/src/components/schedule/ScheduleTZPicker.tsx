"use client";
import { useState } from "react";

export type TZMode = "my-time" | "track-time";

export const TZ_STORAGE_KEY = "f1_schedule_tz_mode";
export const TZ_EVENT       = "f1-tz-change";

export default function ScheduleTZPicker() {
  const [mode, setMode] = useState<TZMode>(() => {
    if (typeof window === "undefined") return "my-time";
    const saved = localStorage.getItem(TZ_STORAGE_KEY);
    return saved === "track-time" ? "track-time" : "my-time";
  });

  const select = (m: TZMode) => {
    setMode(m);
    localStorage.setItem(TZ_STORAGE_KEY, m);
    window.dispatchEvent(new CustomEvent(TZ_EVENT, { detail: m }));
  };

  const OPTIONS: { value: TZMode; icon: string; label: string; sub: string }[] = [
    { value: "my-time",    icon: "📱", label: "My Time",    sub: "Your device" },
    { value: "track-time", icon: "🏟️", label: "Track Time", sub: "At the circuit" },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: "var(--f1-card)",
      border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 10,
      padding: "4px",
    }}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => select(opt.value)}
          title={opt.sub}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: mode === opt.value ? "rgba(0,212,132,.12)" : "transparent",
            border: mode === opt.value ? "1px solid rgba(0,212,132,.28)" : "1px solid transparent",
            borderRadius: 7,
            padding: "6px 12px",
            minHeight: 36,
            fontSize: 11, fontWeight: 700,
            color: mode === opt.value ? "#00d484" : "#71717a",
            cursor: "pointer",
            transition: "all .15s",
            whiteSpace: "nowrap",
            touchAction: "manipulation",
          }}
        >
          <span style={{ fontSize: 13 }}>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
