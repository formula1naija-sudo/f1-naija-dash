"use client";
import { now, utc } from "moment";
import { useState, useEffect } from "react";
import type { Round as RoundType } from "@/types/schedule.type";
import { groupSessionByDay } from "@/lib/groupSessionByDay";
import { formatDayRange, formatMonth } from "@/lib/dateFormatter";
import Flag from "@/components/Flag";

type Props = {
  round: RoundType;
  nextName?: string;
};

const TIMEZONES = [
  { zone: "Africa/Lagos",        flag: "🇳🇬", abbr: "WAT"  },
  { zone: "Africa/Accra",        flag: "🇬🇭", abbr: "GMT"  },
  { zone: "Africa/Johannesburg", flag: "🇿🇦", abbr: "SAST" },
  { zone: "Africa/Nairobi",      flag: "🇰🇪", abbr: "EAT"  },
  { zone: "Europe/London",       flag: "🇬🇧", abbr: "BST"  },
  { zone: "America/New_York",    flag: "🇺🇸", abbr: "ET"   },
];

const TZ_STORAGE_KEY = "f1_schedule_tz";
const TZ_EVENT       = "f1-tz-change";

function formatTime(dateStr: string, timezone: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return utc(dateStr).local().format("HH:mm");
  }
}

const countryCodeMap: Record<string, string> = {
  Australia: "aus", Austria: "aut", Azerbaijan: "aze", Bahrain: "brn",
  Belgium: "bel", Brazil: "bra", Canada: "can", China: "chn",
  Spain: "esp", France: "fra", "Great Britain": "gbr", "United Kingdom": "gbr",
  Germany: "ger", Hungary: "hun", Italy: "ita", Japan: "jpn",
  "Saudi Arabia": "ksa", Mexico: "mex", Monaco: "mon", Netherlands: "ned",
  Portugal: "por", Qatar: "qat", Singapore: "sgp",
  "United Arab Emirates": "uae", "United States": "usa",
};

function sessionAccent(kind: string): { dot: string; label: string } {
  const k = kind.toLowerCase();
  if (k === "race")                                                  return { dot: "#f5a724", label: "#f5a724" };
  if (k.includes("sprint qualifying") || k.includes("shootout"))    return { dot: "#a78bfa", label: "#a78bfa" };
  if (k === "sprint" || k === "sprint race")                        return { dot: "#00d484", label: "#00d484" };
  if (k.includes("qualifying"))                                      return { dot: "#60a5fa", label: "#60a5fa" };
  return { dot: "#52525b", label: "var(--f1-text)" };
}

export default function Round({ round, nextName }: Props) {
  const countryCode = countryCodeMap[round.countryName];
  const isNext = round.name === nextName;
  const isLive = isNext && utc().isBetween(utc(round.start), utc(round.end));

  const [activeTZ, setActiveTZ] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(TZ_STORAGE_KEY);
    if (saved !== null) {
      const idx = parseInt(saved);
      if (!isNaN(idx) && idx >= 0 && idx < TIMEZONES.length) return idx;
    }
    return 0;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") setActiveTZ(detail);
    };
    window.addEventListener(TZ_EVENT, handler);
    return () => window.removeEventListener(TZ_EVENT, handler);
  }, []);

  const tz = TIMEZONES[activeTZ];

  const statusBadge = isLive
    ? { label: "Live",    bg: "rgba(245,167,36,.12)",  color: "#f5a724", border: "rgba(245,167,36,.30)" }
    : isNext
    ? { label: "Up Next", bg: "rgba(0,212,132,.10)",   color: "#00d484", border: "rgba(0,212,132,.25)"  }
    : round.over
    ? { label: "Done",    bg: "rgba(255,255,255,.04)", color: "#52525b", border: "rgba(255,255,255,.07)" }
    : null;

  const accentColor = isLive ? "#f5a724" : "#00d484";

  return (
    <div style={{
      background: "var(--f1-card)",
      border: `1px solid ${isLive ? "rgba(245,167,36,.22)" : isNext ? "rgba(0,212,132,.22)" : "rgba(255,255,255,.06)"}`,
      borderRadius: 14,
      overflow: "hidden",
      opacity: round.over ? 0.45 : 1,
      transition: "border-color .2s, opacity .2s",
    }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        position: "relative",
      }}>
        {/* Left accent bar */}
        {(isNext || isLive) && (
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: 3, background: accentColor, borderRadius: "3px 0 0 3px",
          }} />
        )}

        {/* Country + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{
            width: 40, height: 28, flexShrink: 0,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 5, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Flag countryCode={countryCode} className="h-7 w-10" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 14, fontWeight: 700,
              color: "var(--f1-text)", lineHeight: 1.15,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {round.countryName}
            </span>
            <span style={{
              fontSize: 10, color: "#52525b", lineHeight: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {round.name}
            </span>
          </div>
        </div>

        {/* Date + badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--f1-muted)", whiteSpace: "nowrap" }}>
            {formatMonth(round.start, round.end)} {formatDayRange(round.start, round.end)}
          </span>
          {statusBadge && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".06em",
              borderRadius: 4, padding: "2px 6px",
              background: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`,
            }}>
              {statusBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* ── SESSIONS ───────────────────────────────────── */}
      <div style={{ padding: "10px 16px 14px" }}>
        {groupSessionByDay(round.sessions).map((day, i) => (
          <div key={`day.${i}`}>
            {/* Day label */}
            <div style={{
              fontSize: 9, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".08em",
              color: "#52525b", padding: "6px 0 3px",
            }}>
              {utc(day.date).local().format("dddd")}
            </div>

            {day.sessions.map((session, j) => {
              const accent = sessionAccent(session.kind);
              const isDone = !round.over && utc(session.end).isBefore(now());
              const isLast = j === day.sessions.length - 1;

              return (
                <div
                  key={`session.${i}.${j}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: !isLast ? "1px solid rgba(255,255,255,.04)" : "none",
                    opacity: isDone ? 0.4 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: accent.dot, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: accent.label }}>
                      {session.kind}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    color: isDone ? "#52525b" : "var(--f1-muted)",
                    textDecoration: isDone ? "line-through" : "none",
                    whiteSpace: "nowrap",
                  }}>
                    {formatTime(session.start, tz.zone)}{" "}
                    <span style={{ color: "#52525b" }}>{tz.abbr}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── ACTIONS: Add to Calendar + WhatsApp ─────────── */}
      {!round.over && (() => {
        // Prefer Sunday Race; fall back to Sprint Race / Sprint on sprint weekends
        const raceSession =
          round.sessions.find(s => s.kind === "Race") ??
          round.sessions.find(s => s.kind === "Sprint Race" || s.kind === "Sprint");
        if (!raceSession) return null;

        // Google Calendar URL
        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const gcTitle = encodeURIComponent(`${round.countryName} Grand Prix — F1 Naija`);
        const gcDates = `${fmt(new Date(raceSession.start))}/${fmt(new Date(raceSession.end))}`;
        const gcDetails = encodeURIComponent(`Watch live on F1 Naija 🇳🇬\nf1-naija.vercel.app/dashboard\n\nNigeria: DStv SuperSport F1 (Ch. 208)`);
        const gcUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${gcTitle}&dates=${gcDates}&details=${gcDetails}`;

        // WhatsApp share
        const watTime = new Date(raceSession.start).toLocaleString("en-US", {
          timeZone: "Africa/Lagos",
          weekday: "short", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true,
        });
        const waText = encodeURIComponent(
          `🏎️ ${round.countryName} Grand Prix\n📅 ${watTime} WAT\n\n` +
          `Watch live on F1 Naija 🇳🇬\nf1-naija.vercel.app/dashboard`
        );
        const waUrl = `https://wa.me/?text=${waText}`;

        return (
          <div style={{
            display: "flex", gap: 8,
            padding: "10px 16px 14px",
            borderTop: "1px solid rgba(255,255,255,.05)",
          }}>
            <a
              href={gcUrl}
              target="_blank" rel="noopener noreferrer"
              aria-label={`Add ${round.countryName} Grand Prix to Google Calendar`}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "10px 10px", minHeight: 44, borderRadius: 7, fontSize: 11, fontWeight: 700,
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)",
                color: "var(--f1-muted)", textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              📅 Add to Calendar
            </a>
            <a
              href={waUrl}
              target="_blank" rel="noopener noreferrer"
              aria-label={`Share ${round.countryName} Grand Prix on WhatsApp`}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "10px 10px", minHeight: 44, borderRadius: 7, fontSize: 11, fontWeight: 700,
                background: "rgba(37,211,102,.08)", border: "1px solid rgba(37,211,102,.2)",
                color: "#25d366", textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              💬 Share on WhatsApp
            </a>
          </div>
        );
      })()}
    </div>
  );
}
