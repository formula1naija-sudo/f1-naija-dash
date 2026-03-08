"use client";
import { useState, useEffect } from "react";

const TIMEZONES = [
  { zone: "Africa/Lagos",        flag: "🇳🇬", abbr: "WAT",  label: "Nigeria"      },
  { zone: "Africa/Accra",        flag: "🇬🇭", abbr: "GMT",  label: "Ghana"        },
  { zone: "Africa/Johannesburg", flag: "🇿🇦", abbr: "SAST", label: "South Africa" },
  { zone: "America/New_York",    flag: "🇺🇸", abbr: "ET",   label: "USA (East)"   },
];

const TZ_STORAGE_KEY = "f1_schedule_tz";
const TZ_EVENT = "f1-tz-change";

export default function ScheduleTZPicker() {
  const [activeTZ, setActiveTZ] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(TZ_STORAGE_KEY);
    if (saved !== null) {
      const idx = parseInt(saved);
      if (!isNaN(idx) && idx >= 0 && idx < TIMEZONES.length) {
        setActiveTZ(idx);
      }
    }
  }, []);

  const selectTZ = (i: number) => {
    setActiveTZ(i);
    localStorage.setItem(TZ_STORAGE_KEY, String(i));
    window.dispatchEvent(new CustomEvent(TZ_EVENT, { detail: i }));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-zinc-500 font-medium">Times in:</span>
      <div className="flex gap-1">
        {TIMEZONES.map((tz, i) => (
          <button
            key={tz.zone}
            onClick={() => selectTZ(i)}
            title={tz.label}
            className={
              "flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors " +
              (activeTZ === i
                ? "bg-indigo-700/30 text-indigo-400"
                : "text-zinc-500 hover:text-zinc-300")
            }
          >
            {tz.flag} {tz.abbr}
          </button>
        ))}
      </div>
    </div>
  );
}
