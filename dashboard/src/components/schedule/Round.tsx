"use client";
import { now, utc } from "moment";
import clsx from "clsx";
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
  { zone: "America/New_York",    flag: "🇺🇸", abbr: "ET"   },
];

const TZ_STORAGE_KEY = "f1_schedule_tz";
const TZ_EVENT = "f1-tz-change";

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

export default function Round({ round, nextName }: Props) {
  const countryCode = countryCodeMap[round.countryName];
  const [activeTZ, setActiveTZ] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(TZ_STORAGE_KEY);
    if (saved !== null) {
      const idx = parseInt(saved);
      if (!isNaN(idx) && idx >= 0 && idx < TIMEZONES.length) {
        setActiveTZ(idx);
      }
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") setActiveTZ(detail);
    };
    window.addEventListener(TZ_EVENT, handler);
    return () => window.removeEventListener(TZ_EVENT, handler);
  }, []);

  return (
    <div className={clsx(round.over && "opacity-50")}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Flag countryCode={countryCode} className="h-7 w-10 sm:h-8 sm:w-11" />
            <p className="text-lg sm:text-2xl">{round.countryName}</p>
          </div>
          {round.name === nextName && (
            <>
              {utc().isBetween(utc(round.start), utc(round.end)) ? (
                <p className="text-sm text-indigo-500">Current</p>
              ) : (
                <p className="text-sm text-indigo-500">Up Next</p>
              )}
            </>
          )}
          {round.over && <p className="text-sm text-red-500">Over</p>}
        </div>
        <div className="flex gap-1 text-right">
          <p className="text-base sm:text-xl">{formatMonth(round.start, round.end)}</p>
          <p className="text-sm sm:text-base text-zinc-500">{formatDayRange(round.start, round.end)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-8 pt-2">
        {groupSessionByDay(round.sessions).map((day, i) => (
          <div className="flex flex-col" key={`round.day.${i}`}>
            <p className="my-2 sm:my-3 text-sm sm:text-xl text-white">
              {utc(day.date).local().format("ddd")}
            </p>
            <div className="grid grid-rows-2 gap-2">
              {day.sessions.map((session, j) => (
                <div
                  key={`round.day.${i}.session.${j}`}
                  className={clsx(
                    "flex flex-col",
                    !round.over && utc(session.end).isBefore(now()) && "opacity-50"
                  )}
                >
                  <p className="text-xs sm:text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                    {session.kind}
                  </p>
                  <p className="text-xs leading-none text-zinc-500">
                    {formatTime(session.start, TIMEZONES[activeTZ].zone)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
