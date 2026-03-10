"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { duration, now, utc } from "moment";
import type { Session } from "@/types/schedule.type";

type Props = {
  next: Session;
  type: "race" | "other";
};

const TIMEZONES = [
  { zone: "Africa/Lagos",        abbr: "WAT"  },
  { zone: "Africa/Accra",        abbr: "GMT"  },
  { zone: "Africa/Johannesburg", abbr: "SAST" },
  { zone: "America/New_York",    abbr: "ET"   },
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

export default function Countdown({ next, type }: Props) {
  const [[days, hours, minutes, seconds], setDuration] = useState<
    [number | null, number | null, number | null, number | null]
  >([null, null, null, null]);
  const [mounted, setMounted]   = useState(false);
  const nextMoment              = utc(next.start);
  const requestRef              = useRef<number | null>(null);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const animateNextFrame = () => {
      const diff = duration(nextMoment.diff(now()));
      const d    = parseInt(diff.asDays().toString());
      if (diff.asSeconds() > 0) {
        setDuration([d, diff.hours(), diff.minutes(), diff.seconds()]);
      } else {
        setDuration([0, 0, 0, 0]);
      }
      requestRef.current = requestAnimationFrame(animateNextFrame);
    };
    requestRef.current = requestAnimationFrame(animateNextFrame);
    return () => (requestRef.current ? cancelAnimationFrame(requestRef.current) : void 0);
  }, [nextMoment]);

  const units  = ["days", "hrs", "min", "sec"] as const;
  const values = [days, hours, minutes, seconds];
  const tz     = TIMEZONES[activeTZ];

  const accent      = type === "race" ? "#f5a724"              : "#00d484";
  const accentAlpha = type === "race" ? "rgba(245,167,36,.08)" : "rgba(0,212,132,.08)";

  return (
    <div style={{
      background: "var(--f1-card)",
      border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 14,
      padding: "18px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* top accent line */}
      <div style={{
        position: "absolute", left: 0, top: 0, right: 0,
        height: 2, background: accent, opacity: .65,
        borderRadius: "14px 14px 0 0",
      }} />

      {/* label */}
      <p style={{
        fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: ".08em",
        color: "#52525b",
        marginBottom: 14,
      }}>
        {type === "race" ? "Race" : "Next session"} countdown
      </p>

      {/* digit grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        {units.map((unit, i) => {
          const value = values[i];
          return (
            <div key={unit} style={{
              background: accentAlpha,
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 10,
              padding: "10px 4px 8px",
              textAlign: "center",
            }}>
              <div style={{ minHeight: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!mounted || value == null ? (
                  <div style={{
                    height: 28, width: 32, borderRadius: 6,
                    background: "rgba(255,255,255,.06)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }} />
                ) : (
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={value}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0,  opacity: 1 }}
                      exit={   { y:  8, opacity: 0 }}
                      style={{
                        fontSize: 26, fontWeight: 800,
                        letterSpacing: "-.02em",
                        color: "var(--f1-text)",
                        lineHeight: 1,
                        display: "block",
                      }}
                    >
                      {String(value).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                )}
              </div>
              <p style={{
                fontSize: 9, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: ".07em",
                color: "#52525b",
                marginTop: 5,
              }}>
                {unit}
              </p>
            </div>
          );
        })}
      </div>

      {/* session info row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>
          {next.kind}
        </span>
        <span style={{ fontSize: 11, color: "var(--f1-muted)" }}>
          {formatTime(next.start, tz.zone)}{" "}
          <span style={{ color: "#52525b" }}>{tz.abbr}</span>
        </span>
      </div>
    </div>
  );
}
