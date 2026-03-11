import { useEffect, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

interface PreviousState {
  initialized: boolean;
  trackStatus: string | null;
  sessionName: string | null;
  sessionActive: boolean;
  fastestLapDriver: string | null;
  positions: Record<string, number>;
  retired: Set<string>;
  inPit: Set<string>;
  p1Driver: string | null;
  segmentIndex: number;
  rainfall: string | boolean | undefined;
  lastRCM: string | undefined;
}

// ── Notification helper ────────────────────────────────────────────
// Tries the service worker (works in PWA / background) before falling
// back to the inline Notification API (works when tab is open).
function notify(title: string, body: string, tag?: string, icon = "/pwa-icon.png") {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return; // iOS Safari < 16.4
  if (Notification.permission !== "granted") return;

  // Prefer service worker notifications — they show even if the tab loses focus
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reg.showNotification as (t: string, o: any) => void)(title, {
          body,
          icon,
          badge: icon,
          tag: tag ?? "f1-naija",
          renotify: true,
          vibrate: [150, 60, 150],
          data: { url: "/dashboard" },
        });
      })
      .catch(() => {
        // Fallback to inline notification
        try { new Notification(title, { body, icon }); } catch { /* ignore */ }
      });
  } else {
    try { new Notification(title, { body, icon }); } catch { /* ignore */ }
  }
}

// Priority tiers so we don't spam the user
const PRIORITY = {
  HIGH:   (title: string, body: string) => notify(title, body, "f1-naija-high"),
  NORMAL: (title: string, body: string) => notify(title, body, "f1-naija"),
  FAV:    (title: string, body: string) => notify(title, body, "f1-naija-fav"),
} as const;

export function usePushNotifications() {
  const liveData       = useDataStore((s) => s.state);
  const favoriteDrivers = useSettingsStore((s) => s.favoriteDrivers);

  const prev = useRef<PreviousState>({
    initialized:    false,
    trackStatus:    null,
    sessionName:    null,
    sessionActive:  false,
    fastestLapDriver: null,
    positions:      {},
    retired:        new Set(),
    inPit:          new Set(),
    p1Driver:       null,
    segmentIndex:   -1,
    rainfall:       undefined,
    lastRCM:        undefined,
  });

  // Keep favourite list accessible inside the effect without triggering re-runs
  const favRef = useRef<string[]>(favoriteDrivers);
  useEffect(() => { favRef.current = favoriteDrivers; }, [favoriteDrivers]);

  useEffect(() => {
    if (!liveData) return;
    const p = prev.current;
    const {
      TrackStatus,
      SessionInfo,
      DriverList,
      TimingData,
      TimingAppData,
      SessionStatus,
      WeatherData,
      RaceControlMessages,
    } = liveData;

    // ── First run: silently snapshot state, fire no notifications ────────
    if (!p.initialized) {
      p.trackStatus    = TrackStatus?.Status ?? null;
      p.sessionName    = SessionInfo?.Name ?? null;
      p.sessionActive  = SessionStatus?.Status === "Started";
      p.rainfall       = WeatherData?.Rainfall;

      if (RaceControlMessages?.Messages) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgs = RaceControlMessages.Messages as any[];
        const last = msgs[msgs.length - 1];
        if (last) p.lastRCM = last.Utc;
      }

      if (TimingData?.Lines) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lines = TimingData.Lines as Record<string, any>;
        for (const [num, line] of Object.entries(lines)) {
          const pos = Number(line.Position ?? 0);
          if (pos > 0) p.positions[num] = pos;
          if (pos === 1) p.p1Driver = num;
          if (line.Retired) p.retired.add(num);
          if (line.InPit) p.inPit.add(num);
          if (line.BestLapTime?.OverallFastest) p.fastestLapDriver = num;
        }
      }

      p.segmentIndex = TimingData?.SessionPart ?? -1;
      p.initialized = true;
      return;
    }

    // ── Track status ─────────────────────────────────────────────────────
    const trackStatus = TrackStatus?.Status ?? null;
    if (trackStatus && trackStatus !== p.trackStatus) {
      // F1 API TrackStatus codes: 1=AllClear, 2=Yellow, 4=SafetyCar, 5=RedFlag, 6=VSC, 7=VSCEnding
      if      (trackStatus === "4") PRIORITY.HIGH("🟡 Safety Car",         "Safety Car has been deployed");
      else if (trackStatus === "5") PRIORITY.HIGH("🔴 Red Flag",           "Session has been red flagged");
      else if (trackStatus === "6") PRIORITY.HIGH("🟡 Virtual Safety Car", "VSC is now active");
      else if (trackStatus === "7") PRIORITY.NORMAL("🟡 VSC Ending",       "Virtual Safety Car ending — prepare to push");
      else if (trackStatus === "1" && p.trackStatus && p.trackStatus !== "1")
                                    PRIORITY.HIGH("🟢 Track Clear",        "Green flag — racing resumed");
      p.trackStatus = trackStatus;
    }

    // ── Session start / end ───────────────────────────────────────────────
    const sessionName   = SessionInfo?.Name ?? null;
    const sessionActive = SessionStatus?.Status === "Started";

    if (sessionName !== p.sessionName && sessionName) {
      PRIORITY.NORMAL("🏁 Session Starting", sessionName);
      p.sessionName = sessionName;
      // Reset per-session state so stale data from a previous session
      // (retired cars, pit status, positions) does not bleed into the new one
      p.positions        = {};
      p.retired          = new Set(); // also reused for knockedOut in qualifying
      p.inPit            = new Set();
      p.p1Driver         = null;
      p.fastestLapDriver = null;
      p.segmentIndex     = -1;
    }
    if (!p.sessionActive && sessionActive) {
      PRIORITY.NORMAL("🏁 Session Live", `${sessionName ?? "Session"} is now underway`);
    }
    if (p.sessionActive && !sessionActive && SessionStatus?.Status === "Finished") {
      PRIORITY.NORMAL("🏁 Session Finished", `${sessionName ?? "Session"} has ended`);
    }
    p.sessionActive = sessionActive;

    // ── Rainfall ──────────────────────────────────────────────────────────
    const rainfall = WeatherData?.Rainfall;
    if (rainfall && rainfall !== p.rainfall) {
      PRIORITY.HIGH("🌧️ Rain!", "Rain detected at the circuit — tyre change incoming?");
    }
    p.rainfall = rainfall;

    // ── Position changes, retirements, pit stops ─────────────────────────
    if (TimingData?.Lines && DriverList) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lines   = TimingData.Lines as Record<string, any>;
      const favSet  = new Set(favRef.current);

      for (const [num, line] of Object.entries(lines)) {
        const pos: number = Number(line.Position ?? 0);
        const name   = DriverList[num]?.FullName ?? `Car #${num}`;
        const isFav  = favSet.has(num);
        const prevPos = p.positions[num];

        // ── P1 change ──
        if (pos === 1 && p.p1Driver && p.p1Driver !== num) {
          PRIORITY.NORMAL("🥇 Lead Change!", `${name} takes the lead`);
          p.p1Driver = num;
        } else if (pos === 1 && !p.p1Driver) {
          p.p1Driver = num;
        }

        // ── Overtake into top 10 (≤3 place gain) or ANY fav overtake ──
        if (pos > 0 && prevPos && prevPos !== pos) {
          const gain = prevPos - pos;
          if (gain > 0) {
            if (isFav) {
              // Always notify for fav driver moves
              const emoji = pos === 1 ? "🥇" : pos <= 3 ? "🏆" : "🔄";
              PRIORITY.FAV(`${emoji} Your Driver — P${pos}`, `${name} moves up to P${pos} (+${gain})`);
            } else if (pos <= 10 && gain <= 3) {
              PRIORITY.NORMAL("🔄 Overtake", `${name} moves up to P${pos}`);
            }
          }
        }

        // ── Fastest lap ──
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((line as any).BestLapTime?.OverallFastest && num !== p.fastestLapDriver) {
          if (isFav) {
            PRIORITY.FAV("⚡ Your Driver — Fastest Lap!", `${name} sets the fastest lap 💜`);
          } else {
            PRIORITY.NORMAL("⚡ Fastest Lap", `${name} sets the fastest lap`);
          }
          p.fastestLapDriver = num;
        }

        // ── Retirement ──
        if (line.Retired && !p.retired.has(num)) {
          if (isFav) {
            PRIORITY.FAV("💔 Your Driver Retired", `${name} has retired from the race`);
          } else {
            PRIORITY.NORMAL("❌ Retirement", `${name} has retired`);
          }
          p.retired.add(num);
        }

        if (pos > 0) p.positions[num] = pos;
      }

      // ── Pit stop alerts for favorite drivers (from TimingAppData) ────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appLines = (TimingAppData?.Lines ?? {}) as Record<string, any>;
      for (const num of Array.from(favSet)) {
        const appLine = appLines[num];
        const timingLine = lines[num];
        if (!appLine || !timingLine) continue;

        const nowInPit  = !!(timingLine.InPit || timingLine.PitOut);
        const wasInPit  = p.inPit.has(num);
        const dName     = DriverList[num]?.FullName ?? `Car #${num}`;
        const stints    = appLine.Stints ?? [];
        const lastStint = stints[stints.length - 1];

        // Just entered pit
        if (nowInPit && !wasInPit) {
          const compound = lastStint?.Compound ?? "Unknown";
          PRIORITY.FAV("🔧 Your Driver — Pitting", `${dName} is in the pits (${compound})`);
          p.inPit.add(num);
        }

        // Just exited pit (PitOut goes false)
        if (!nowInPit && wasInPit) {
          const newStint = stints[stints.length - 1];
          const newCompound = newStint?.Compound ?? "Unknown";
          PRIORITY.FAV("🔧 Your Driver — Out", `${dName} exits pits on ${newCompound} tyres`);
          p.inPit.delete(num);
        }
      }
    }

    // ── Qualifying segments (Q1 / Q2 / Q3) + knockout alerts ─────────────
    if (SessionInfo?.Type === "Qualifying" || SessionInfo?.Type?.includes("Qualifying")) {
      const segIdx: number = TimingData?.SessionPart ?? -1;
      if (segIdx > 0 && segIdx !== p.segmentIndex && p.segmentIndex !== -1) {
        const partNames: Record<number, string> = { 1: "Q1", 2: "Q2", 3: "Q3" };
        const part = partNames[segIdx] ?? `Part ${segIdx}`;
        PRIORITY.NORMAL("🏎️ Qualifying", `${part} is now underway`);
      }
      p.segmentIndex = segIdx;

      // Knocked-out driver alerts
      if (TimingData?.Lines && DriverList) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lines = TimingData.Lines as Record<string, any>;
        for (const [num, line] of Object.entries(lines)) {
          if (line.KnockedOut && !p.retired.has(num)) {
            const name = DriverList[num]?.FullName ?? `Car #${num}`;
            const isFav = favRef.current.includes(num);
            if (isFav) {
              PRIORITY.FAV("💔 Your Driver Eliminated", `${name} is out of qualifying`);
            } else {
              PRIORITY.NORMAL("🚫 Knocked Out", `${name} has been eliminated`);
            }
            p.retired.add(num); // reuse retired set to prevent re-firing
          }
        }
      }
    }

    // ── Race control messages ─────────────────────────────────────────────
    // Push ALL category-relevant messages so users never miss a flag/penalty
    if (RaceControlMessages?.Messages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgs = RaceControlMessages.Messages as any[];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.Utc !== p.lastRCM) {
        const txt: string = lastMsg.Message ?? "";
        // Broadcast high-priority track events
        if (/safety car/i.test(txt) || /red flag/i.test(txt)) {
          // Already handled via TrackStatus — skip to avoid double-notif
        } else if (/rain/i.test(txt)) {
          PRIORITY.HIGH("🌧️ Race Control", txt.slice(0, 80));
        } else if (/penalty/i.test(txt) || /investigation/i.test(txt)) {
          PRIORITY.NORMAL("📋 Race Control", txt.slice(0, 80));
        } else if (/chequered/i.test(txt) || /fastest lap/i.test(txt)) {
          PRIORITY.NORMAL("🏁 Race Control", txt.slice(0, 80));
        }
        // Always alert for fav driver mentions
        const favNums = favRef.current;
        for (const num of favNums) {
          if (txt.includes(`CAR ${num}`) || txt.includes(`#${num}`)) {
            PRIORITY.FAV("📻 Your Driver — Race Control", txt.slice(0, 80));
            break;
          }
        }
        p.lastRCM = lastMsg.Utc;
      }
    }
  }, [liveData]);
}
