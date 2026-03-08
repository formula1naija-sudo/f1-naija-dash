import { useEffect, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";

interface PreviousState {
  initialized: boolean;
  trackStatus: string | null;
  sessionName: string | null;
  sessionActive: boolean;
  fastestLapDriver: string | null;
  positions: Record<string, number>;
  retired: Set<string>;
  segmentIndex: number;
  rainfall: string | boolean | undefined;
  lastRCM: string | undefined;
}

function notify(title: string, body: string, icon = "/pwa-icon.png") {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return; // iOS Safari < 16.4 has no Notification API
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon });
  } catch {
    // silently ignore if notifications unavailable
  }
}

export function usePushNotifications() {
  const liveData = useDataStore((s) => s.state);
  const prev = useRef<PreviousState>({
    initialized: false,
    trackStatus: null,
    sessionName: null,
    sessionActive: false,
    fastestLapDriver: null,
    positions: {},
    retired: new Set(),
    segmentIndex: -1,
    rainfall: undefined,
    lastRCM: undefined,
  });

  useEffect(() => {
    if (!liveData) return;
    const p = prev.current;
    const {
      TrackStatus,
      SessionInfo,
      DriverList,
      TimingData,
      SessionStatus,
      WeatherData,
      RaceControlMessages,
    } = liveData;

    // ── First run: silently snapshot state, fire no notifications ────────
    if (!p.initialized) {
      p.trackStatus = TrackStatus?.Status ?? null;
      p.sessionName = SessionInfo?.Name ?? null;
      p.sessionActive = SessionStatus?.Status === "Started";
      p.rainfall = WeatherData?.Rainfall;
      if (RaceControlMessages?.Messages) {
        const msgs = RaceControlMessages.Messages as any[];
        const last = msgs[msgs.length - 1];
        if (last) p.lastRCM = last.Utc;
      }
      if (TimingData?.Lines) {
        const lines = TimingData.Lines as Record<string, any>;
        for (const [num, line] of Object.entries(lines)) {
          const pos = Number(line.Position ?? 0);
          if (pos > 0) p.positions[num] = pos;
          if (line.Retired) p.retired.add(num);
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
      if (trackStatus === "4") notify("🟡 Safety Car", "Safety Car has been deployed");
      else if (trackStatus === "6") notify("🔴 Red Flag", "Session has been red flagged");
      else if (trackStatus === "5") notify("🟠 Virtual Safety Car", "VSC is now active");
      else if (trackStatus === "1" && p.trackStatus && p.trackStatus !== "1")
        notify("🟢 Track Clear", "Green flag — racing resumed");
      p.trackStatus = trackStatus;
    }

    // ── Session start / end ───────────────────────────────────────────────
    const sessionName = SessionInfo?.Name ?? null;
    const sessionActive = SessionStatus?.Status === "Started";
    if (sessionName !== p.sessionName && sessionName) {
      notify("🏁 Session Starting", sessionName);
      p.sessionName = sessionName;
    }
    if (!p.sessionActive && sessionActive) {
      notify("🏁 Session Live", `${sessionName ?? "Session"} is now underway`);
    }
    if (p.sessionActive && !sessionActive && SessionStatus?.Status === "Finished") {
      notify("🏁 Session Finished", `${sessionName ?? "Session"} has ended`);
    }
    p.sessionActive = sessionActive;

    // ── Rainfall ──────────────────────────────────────────────────────────
    const rainfall = WeatherData?.Rainfall;
    if (rainfall && rainfall !== p.rainfall) {
      notify("🌧️ Rain!", "Rain detected at the circuit");
    }
    p.rainfall = rainfall;

    // ── Fastest lap ───────────────────────────────────────────────────────
    if (TimingData?.Lines) {
      const lines = TimingData.Lines as Record<string, any>;
      for (const [num, line] of Object.entries(lines)) {
        if (
          line.BestLapTime?.OverallFastest &&
          num !== p.fastestLapDriver
        ) {
          const name = DriverList?.[num]?.FullName ?? `Car #${num}`;
          notify("⚡ Fastest Lap", `${name} sets the fastest lap`);
          p.fastestLapDriver = num;
        }
      }
    }

    // ── Position changes & retirements ────────────────────────────────────
    if (TimingData?.Lines && DriverList) {
      const lines = TimingData.Lines as Record<string, any>;
      for (const [num, line] of Object.entries(lines)) {
        const pos: number = Number(line.Position ?? 0);
        const name = DriverList[num]?.FullName ?? `Car #${num}`;
        const prevPos = p.positions[num];

        // Overtake into top 10 with ≤2 place gain
        if (pos > 0 && pos <= 10 && prevPos && prevPos !== pos) {
          const gain = prevPos - pos;
          if (gain > 0 && gain <= 2) {
            notify("🔄 Overtake", `${name} moves up to P${pos}`);
          }
        }

        // Retirement
        if (line.Retired && !p.retired.has(num)) {
          notify("❌ Retirement", `${name} has retired from the race`);
          p.retired.add(num);
        }

        if (pos > 0) p.positions[num] = pos;
      }
    }

    // ── Qualifying segments (Q1 / Q2 / Q3) ───────────────────────────────
    if (SessionInfo?.Type === "Qualifying") {
      const segIdx: number = TimingData?.SessionPart ?? -1;
      if (segIdx > 0 && segIdx !== p.segmentIndex && p.segmentIndex !== -1) {
        const partNames: Record<number, string> = { 1: "Q1", 2: "Q2", 3: "Q3" };
        const part = partNames[segIdx] ?? `Part ${segIdx}`;
        notify("🏎️ Qualifying", `${part} is now underway`);
      }
      p.segmentIndex = segIdx;
    }

    // ── Race control — SC / red flag / rain messages ──────────────────────
    if (RaceControlMessages?.Messages) {
      const msgs = RaceControlMessages.Messages as any[];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.Utc !== p.lastRCM) {
        const txt: string = lastMsg.Message ?? "";
        if (/safety car/i.test(txt) || /red flag/i.test(txt) || /rain/i.test(txt)) {
          notify("📻 Race Control", txt.slice(0, 80));
        }
        p.lastRCM = lastMsg.Utc;
      }
    }
  }, [liveData]);
}
