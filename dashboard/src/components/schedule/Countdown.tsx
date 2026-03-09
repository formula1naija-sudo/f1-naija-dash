"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { duration, now, utc } from "moment";
import type { Session } from "@/types/schedule.type";

type Props = {
  next: Session;
  type: "race" | "other";
};

export default function Countdown({ next, type }: Props) {
  const [[days, hours, minutes, seconds], setDuration] = useState<
    [number | null, number | null, number | null, number | null]
  >([null, null, null, null]);
  const [mounted, setMounted] = useState(false);
  const nextMoment = utc(next.start);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const animateNextFrame = () => {
      const diff = duration(nextMoment.diff(now()));
      const days = parseInt(diff.asDays().toString());
      if (diff.asSeconds() > 0) {
        setDuration([days, diff.hours(), diff.minutes(), diff.seconds()]);
      } else {
        setDuration([0, 0, 0, 0]);
      }
      requestRef.current = requestAnimationFrame(animateNextFrame);
    };
    requestRef.current = requestAnimationFrame(animateNextFrame);
    return () => (requestRef.current ? cancelAnimationFrame(requestRef.current) : void 0);
  }, [nextMoment]);

  const units = ["days", "hours", "minutes", "seconds"] as const;
  const values = [days, hours, minutes, seconds];

  return (
    <div>
      <p className="text-lg">Next {type === "race" ? "race" : "session"} in</p>
      <div className="grid auto-cols-max grid-flow-col gap-4 text-3xl">
        {units.map((unit, i) => {
          const value = values[i];
          return (
            <div key={unit}>
              {!mounted || value == null ? (
                <div className="h-9 w-12 animate-pulse rounded-md bg-zinc-800" />
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.p
                    className="min-w-12"
                    key={value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                  >
                    {value}
                  </motion.p>
                </AnimatePresence>
              )}
              <p className="text-base text-zinc-500">{unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
