"use client";
import { useState } from "react";

const TIMEZONES = [
  { zone: "Africa/Lagos",        flag: "🇳🇬", abbr: "WAT",  label: "Nigeria"      },
  { zone: "Africa/Accra",        flag: "🇬🇭", abbr: "GMT",  label: "Ghana"        },
  { zone: "Africa/Johannesburg", flag: "🇿🇦", abbr: "SAST", label: "South Africa" },
  { zone: "America/New_York",    flag: "🇺🇸", abbr: "ET",   label: "USA (East)"   },
];

const TZ_STORAGE_KEY = "f1_schedule_tz";
const TZ_EVENT       = "f1-tz-change";

export default function ScheduleTZPicker() {
  const [activeTZ, setActiveTZ] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(TZ_STORAGE_KEY);
    if (saved !== null) {
      const idx = parseInt(saved);
      if (!isNaN(idx) && idx >= 0 && idx < TIMEZONES.length) return idx;
    }
    return 0;
  });

  const selectTZ = (i: number) => {
    setActiveTZ(i);
    localStorage.setItem(TZ_STORAGE_KEY, String(i));
    window.dispatchEvent(new CustomEvent(TZ_EVENT, { detail: i }));
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "var(--f1-card)",
      border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 10,
      padding: "5px 8px",
    }}>
      <span style={{
        fontSize: 10, fontWeight: 600,
        color: "#52525b",
        textTransform: "uppercase", letterSpacing: ".06em",
        paddingRight: 8,
        borderRight: "1px solid rgba(255,255,255,.07)",
        marginRight: 2,
        whiteSpace: "nowrap",
      }}>
        Times in
      </span>
      <div style={{ display: "flex", gap: 2 }}>
        {TIMEZONES.map((tz, i) => (
          <button
            key={tz.zone}
            onClick={() => selectTZ(i)}
            title={tz.label}
            style={{
              background: activeTZ === i ? "rgba(0,212,132,.12)" : "transparent",
              border: activeTZ === i ? "1px solid rgba(0,212,132,.28)" : "1px solid transparent",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 11, fontWeight: 600,
              color: activeTZ === i ? "#00d484" : "#71717a",
              cursor: "pointer",
              transition: "all .15s",
              whiteSpace: "nowrap",
            }}
          >
            {tz.flag} {tz.abbr}
          </button>
        ))}
      </div>
    </div>
  );
}
