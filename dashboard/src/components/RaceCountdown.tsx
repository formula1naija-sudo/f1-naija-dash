"use client";
import { useState, useEffect } from "react";
import Flag from "@/components/Flag";

type Session = {
  kind: string;
  start: string;
  end: string;
};

type Round = {
  name: string;
  countryName: string;
  start: string;
  end: string;
  sessions: Session[];
  over: boolean;
};

type TZConfig = {
  zone: string;
  label: string;
  flag: string;
  abbr: string;
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  Australia: "aus",
  Austria: "aut",
  Azerbaijan: "aze",
  Bahrain: "brn",
  Belgium: "bel",
  Brazil: "bra",
  Canada: "can",
  China: "chn",
  Spain: "esp",
  France: "fra",
  "Great Britain": "gbr",
  "United Kingdom": "gbr",
  Germany: "ger",
  Hungary: "hun",
  Italy: "ita",
  Japan: "jpn",
  "Saudi Arabia": "ksa",
  Mexico: "mex",
  Monaco: "mon",
  Netherlands: "ned",
  Portugal: "por",
  Qatar: "qat",
  Singapore: "sgp",
  "United Arab Emirates": "uae",
  "United States": "usa",
};

const TIMEZONES: TZConfig[] = [
  { zone: "Africa/Lagos",        label: "Nigeria",      flag: "🇳🇬", abbr: "WAT"  },
  { zone: "Africa/Accra",        label: "Ghana",        flag: "🇬🇭", abbr: "GMT"  },
  { zone: "Africa/Johannesburg", label: "South Africa", flag: "🇿🇦", abbr: "SAST" },
  { zone: "Africa/Nairobi",      label: "Kenya",        flag: "🇰🇪", abbr: "EAT"  },
  { zone: "Europe/London",       label: "UK",           flag: "🇬🇧", abbr: "BST"  },
  { zone: "America/New_York",    label: "USA (East)",   flag: "🇺🇸", abbr: "ET"   },
];

function formatTZ(dateStr: string, timeZone: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getSessionLabel(kind: string): string {
  const labels: { [key: string]: string } = {
    "Practice 1": "FP1",
    "Practice 2": "FP2",
    "Practice 3": "FP3",
    "Sprint Qualifying": "SQ",
    "Sprint": "SPRINT",
    "Qualifying": "QUALI",
    "Race": "RACE",
  };
  return labels[kind] || kind;
}

const HOW_TO_WATCH = [
  { provider: "DStv",  channel: "SuperSport F1 · Channel 215", href: null },
  { provider: "F1 TV", channel: "f1tv.formula1.com",           href: "https://f1tv.formula1.com" },
];

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[60px] rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center font-mono text-3xl font-extrabold text-white sm:min-w-[68px] sm:text-4xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
    </div>
  );
}

export default function RaceCountdown() {
  const [nextRace, setNextRace] = useState<Round | null>(null);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTZ, setActiveTZ] = useState(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule");
        if (!res.ok) throw new Error("Failed to fetch");
        const schedule: Round[] = await res.json();

        // Only count rounds that have a Race session (excludes pre-season tests)
        const raceRounds = schedule.filter((r) =>
          r.sessions.some((s) => s.kind === "Race")
        );
        setTotalRounds(raceRounds.length);

        const next = raceRounds.find((round) => !round.over);
        if (next) {
          const idx = raceRounds.indexOf(next) + 1;
          setNextRace(next);
          setRoundIndex(idx);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (!nextRace) return;
    const raceSession = nextRace.sessions.find(
      (s) => s.kind === "Race" || s.kind === "Sprint"
    );
    const targetSession = raceSession || nextRace.sessions[0];
    if (!targetSession) return;

    const targetDate = new Date(targetSession.start).getTime();
    const update = () => {
      const diff = targetDate - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  if (loading) {
    return (
      <div className="mx-auto mb-10 w-full max-w-lg animate-pulse rounded-2xl border border-zinc-800 p-8">
        <div className="mb-4 h-4 w-32 rounded bg-zinc-800" />
        <div className="mb-6 h-6 w-64 rounded bg-zinc-800" />
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-16 rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !nextRace) {
    return null;
  }

  const countryCode = COUNTRY_CODE_MAP[nextRace.countryName];

  return (
    <div className="mx-auto mb-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-gradient-to-b from-white/[0.02] to-transparent p-6 sm:p-8">
      <div className="mb-6">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
          Next Race — Round {roundIndex}/{totalRounds}
        </p>
        <h3 className="text-xl font-bold text-white sm:text-2xl">
          {nextRace.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <Flag countryCode={countryCode} className="h-5 w-7" />
          <p className="text-sm text-zinc-500">{nextRace.countryName}</p>
        </div>
      </div>

      <div
        className="mb-7 flex justify-center gap-2 sm:gap-3"
        role="timer"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.mins} minutes, ${timeLeft.secs} seconds until ${nextRace.name}`}
        aria-live="off"
      >
        <CountdownUnit value={timeLeft.days} label="Days" />
        <span className="self-start pt-3 text-2xl font-light text-zinc-700" aria-hidden="true">:</span>
        <CountdownUnit value={timeLeft.hours} label="Hours" />
        <span className="self-start pt-3 text-2xl font-light text-zinc-700" aria-hidden="true">:</span>
        <CountdownUnit value={timeLeft.mins} label="Mins" />
        <span className="self-start pt-3 text-2xl font-light text-zinc-700" aria-hidden="true">:</span>
        <CountdownUnit value={timeLeft.secs} label="Secs" />
      </div>

      <div>
        <div className="mb-3 flex gap-1 overflow-x-auto pb-1" role="group" aria-label="Select timezone">
          {TIMEZONES.map((tz, i) => (
            <button
              key={tz.zone}
              onClick={() => setActiveTZ(i)}
              aria-pressed={activeTZ === i}
              aria-label={`Show times in ${tz.label} (${tz.abbr})`}
              className={
                "flex-shrink-0 rounded-lg px-3 text-[11px] font-semibold uppercase tracking-wide transition-colors " +
                (activeTZ === i
                  ? "bg-emerald-700/30 text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300")
              }
              style={{ minHeight: 44, minWidth: 44 }}
            >
              {tz.flag} {tz.abbr}
            </button>
          ))}
        </div>

        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Session times · {TIMEZONES[activeTZ].label}
        </p>
        <div className="flex flex-col gap-1.5">
          {nextRace.sessions.map((session, i) => {
            const isRace = session.kind === "Race" || session.kind === "Sprint";
            return (
              <div
                key={i}
                className={
                  "flex items-center justify-between rounded-lg px-3.5 py-2 text-sm " +
                  (isRace
                    ? "border border-emerald-700/30 bg-emerald-900/15"
                    : "border border-white/5 bg-white/[0.03]")
                }
              >
                <span
                  className={
                    "min-w-[52px] text-xs font-bold " +
                    (isRace ? "text-emerald-400" : "text-zinc-200")
                  }
                >
                  {getSessionLabel(session.kind)}
                </span>
                <span
                  className={
                    "font-mono text-xs " +
                    (isRace ? "text-emerald-400" : "text-zinc-400")
                  }
                >
                  {formatTZ(session.start, TIMEZONES[activeTZ].zone)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HOW TO WATCH IN NIGERIA ─────────────────────── */}
      <div style={{
        marginTop: 20, paddingTop: 16,
        borderTop: "1px solid rgba(255,255,255,.07)",
      }}>
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          📺 How to watch in Nigeria
        </p>
        <div className="flex flex-col gap-2">
          {HOW_TO_WATCH.map(item => (
            <div key={item.provider} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <span className="text-xs font-semibold text-zinc-200">{item.provider}</span>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:underline">{item.channel}</a>
              ) : (
                <span className="text-xs text-zinc-500">{item.channel}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
